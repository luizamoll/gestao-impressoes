package gestao_impressoes.mural;

import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@Profile("mural-lab")
public class MuralLabStore {
    public record Comment(long id, String author, String text, String createdAt, boolean hidden) {}
    public record Post(long id, String title, String content, String author,
                       String createdAt, boolean commentsAllowed, List<Comment> comments) {
        public Post {
            comments = List.copyOf(comments);
        }
    }

    private final Path file;
    private List<Post> posts = new ArrayList<>();
    private long nextPostId = 1;
    private long nextCommentId = 1;

    public MuralLabStore(@Value("${mural.lab.file}") String fileName) throws Exception {
        file = Path.of(fileName).toAbsolutePath().normalize();
        load();
    }

    public synchronized List<Post> all() {
        return List.copyOf(posts).reversed();
    }

    public synchronized Post publish(String title, String content, String author, boolean commentsAllowed) {
        String validTitle = valid(title, 4, 90, "titulo");
        String validContent = valid(content, 8, 1200, "mensagem");
        if (posts.size() >= 100) throw new ResponseStatusException(HttpStatus.CONFLICT, "Limite de publicacoes do laboratorio.");
        Post post = new Post(nextPostId, validTitle, validContent, author, Instant.now().toString(), commentsAllowed, List.of());
        List<Post> updated = new ArrayList<>(posts);
        updated.add(post);
        persist(updated, nextPostId + 1, nextCommentId);
        return post;
    }

    public synchronized Comment comment(long postId, String text, String author) {
        Post original = find(postId);
        if (!original.commentsAllowed()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Comentarios desativados.");
        if (original.comments().size() >= 100) throw new ResponseStatusException(HttpStatus.CONFLICT, "Limite de comentarios do laboratorio.");
        String validText = valid(text, 3, 350, "comentario");
        Comment comment = new Comment(nextCommentId, author, validText, Instant.now().toString(), false);
        List<Comment> comments = new ArrayList<>(original.comments());
        comments.add(comment);
        List<Post> updated = replace(new Post(original.id(), original.title(), original.content(),
            original.author(), original.createdAt(), original.commentsAllowed(), comments));
        persist(updated, nextPostId, nextCommentId + 1);
        return comment;
    }

    public synchronized void setHidden(long postId, long commentId, boolean hidden) {
        Post original = find(postId);
        List<Comment> comments = new ArrayList<>();
        boolean found = false;
        for (Comment c : original.comments()) {
            if (c.id() == commentId) {
                comments.add(new Comment(c.id(), c.author(), c.text(), c.createdAt(), hidden));
                found = true;
            } else comments.add(c);
        }
        if (!found) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario inexistente.");
        persist(replace(new Post(original.id(), original.title(), original.content(),
            original.author(), original.createdAt(), original.commentsAllowed(), comments)), nextPostId, nextCommentId);
    }

    public synchronized void setCommentsAllowed(long postId, boolean allowed) {
        Post original = find(postId);
        persist(replace(new Post(original.id(), original.title(), original.content(),
            original.author(), original.createdAt(), allowed, original.comments())), nextPostId, nextCommentId);
    }

    public synchronized void remove(long postId) {
        find(postId);
        List<Post> updated = new ArrayList<>(posts);
        updated.removeIf(p -> p.id() == postId);
        persist(updated, nextPostId, nextCommentId);
    }

    private Post find(long id) {
        return posts.stream().filter(p -> p.id() == id).findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicacao inexistente."));
    }

    private List<Post> replace(Post newPost) {
        List<Post> updated = new ArrayList<>();
        for (Post p : posts) updated.add(p.id() == newPost.id() ? newPost : p);
        return updated;
    }

    private static String valid(String input, int min, int max, String field) {
        String s = input == null ? "" : input.strip();
        if (s.length() < min || s.length() > max || s.indexOf('\0') >= 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tamanho invalido para " + field + ".");
        if (s.matches("(?is).*https?://.*") || s.matches("(?s).*\\S+@\\S+\\.\\S+.*"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Links e emails nao sao aceitos no laboratorio.");
        return s;
    }

    private void load() throws Exception {
        if (!Files.exists(file)) return;
        Properties data = new Properties();
        try (InputStream in = Files.newInputStream(file)) { data.load(in); }
        long candidatePost = Long.parseLong(data.getProperty("nextPostId", "1"));
        long candidateComment = Long.parseLong(data.getProperty("nextCommentId", "1"));
        int count = Integer.parseInt(data.getProperty("posts.count", "0"));
        if (count < 0 || count > 100) throw new IllegalStateException("Arquivo do mural invalido.");
        List<Post> loaded = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            String prefix = "post." + i + ".";
            int commentCount = Integer.parseInt(data.getProperty(prefix + "comments.count", "0"));
            if (commentCount < 0 || commentCount > 100) throw new IllegalStateException("Comentarios invalidos.");
            List<Comment> comments = new ArrayList<>();
            for (int j = 0; j < commentCount; j++) {
                String c = prefix + "comment." + j + ".";
                comments.add(new Comment(Long.parseLong(data.getProperty(c + "id")),
                    data.getProperty(c + "author"), data.getProperty(c + "text"),
                    data.getProperty(c + "createdAt"), Boolean.parseBoolean(data.getProperty(c + "hidden"))));
            }
            loaded.add(new Post(Long.parseLong(data.getProperty(prefix + "id")),
                data.getProperty(prefix + "title"), data.getProperty(prefix + "content"),
                data.getProperty(prefix + "author"), data.getProperty(prefix + "createdAt"),
                Boolean.parseBoolean(data.getProperty(prefix + "commentsAllowed")), comments));
        }
        posts = loaded;
        nextPostId = candidatePost;
        nextCommentId = candidateComment;
    }

    private void persist(List<Post> updated, long postCounter, long commentCounter) {
        Properties data = new Properties();
        data.setProperty("nextPostId", Long.toString(postCounter));
        data.setProperty("nextCommentId", Long.toString(commentCounter));
        data.setProperty("posts.count", Integer.toString(updated.size()));
        for (int i = 0; i < updated.size(); i++) {
            Post post = updated.get(i);
            String prefix = "post." + i + ".";
            data.setProperty(prefix + "id", Long.toString(post.id()));
            data.setProperty(prefix + "title", post.title());
            data.setProperty(prefix + "content", post.content());
            data.setProperty(prefix + "author", post.author());
            data.setProperty(prefix + "createdAt", post.createdAt());
            data.setProperty(prefix + "commentsAllowed", Boolean.toString(post.commentsAllowed()));
            data.setProperty(prefix + "comments.count", Integer.toString(post.comments().size()));
            for (int j = 0; j < post.comments().size(); j++) {
                Comment c = post.comments().get(j);
                String key = prefix + "comment." + j + ".";
                data.setProperty(key + "id", Long.toString(c.id()));
                data.setProperty(key + "author", c.author());
                data.setProperty(key + "text", c.text());
                data.setProperty(key + "createdAt", c.createdAt());
                data.setProperty(key + "hidden", Boolean.toString(c.hidden()));
            }
        }
        try {
            Files.createDirectories(file.getParent());
            Path temp = Files.createTempFile(file.getParent(), "mural-", ".tmp");
            try {
                try (OutputStream out = Files.newOutputStream(temp)) { data.store(out, "Portal UNH — mural de laboratorio. Dados ficticios."); }
                try { Files.move(temp, file, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING); }
                catch (AtomicMoveNotSupportedException e) { Files.move(temp, file, StandardCopyOption.REPLACE_EXISTING); }
            } finally { Files.deleteIfExists(temp); }
            posts = updated;
            nextPostId = postCounter;
            nextCommentId = commentCounter;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao salvar o laboratorio.", ex);
        }
    }
}
