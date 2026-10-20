package gestao_impressoes.mural;

import java.util.List;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("mural-lab")
@RequestMapping("/api/laboratorio/mural/posts")
public class MuralLabController {
    private final MuralLabStore store;
    public MuralLabController(MuralLabStore store) { this.store = store; }

    public record NewPost(String title, String content, Boolean commentsAllowed) {}
    public record NewComment(String text) {}
    public record Visibility(Boolean hidden) {}
    public record Toggle(Boolean allowed) {}

    @GetMapping
    public ResponseEntity<List<MuralLabStore.Post>> posts() {
        return ResponseEntity.ok().header("Cache-Control", "no-store").body(store.all());
    }

    @PostMapping
    public ResponseEntity<MuralLabStore.Post> publish(@RequestBody NewPost request, Authentication user) {
        MuralLabStore.Post result = store.publish(request.title(), request.content(), user.getName(),
            !Boolean.FALSE.equals(request.commentsAllowed()));
        return ResponseEntity.status(HttpStatus.CREATED).header("Cache-Control", "no-store").body(result);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<MuralLabStore.Comment> comment(@PathVariable long postId,
            @RequestBody NewComment request, Authentication user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(store.comment(postId, request.text(), user.getName()));
    }

    @PatchMapping("/{postId}/comments/{commentId}/hidden")
    public ResponseEntity<Void> moderate(@PathVariable long postId, @PathVariable long commentId,
                                         @RequestBody Visibility request) {
        if (request.hidden() == null) return ResponseEntity.badRequest().build();
        store.setHidden(postId, commentId, request.hidden());
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{postId}/comments-open")
    public ResponseEntity<Void> allowComments(@PathVariable long postId, @RequestBody Toggle request) {
        if (request.allowed() == null) return ResponseEntity.badRequest().build();
        store.setCommentsAllowed(postId, request.allowed());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> remove(@PathVariable long postId) {
        store.remove(postId);
        return ResponseEntity.noContent().build();
    }
}
