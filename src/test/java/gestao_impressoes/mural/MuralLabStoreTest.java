package gestao_impressoes.mural;

import static org.junit.jupiter.api.Assertions.*;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.server.ResponseStatusException;

class MuralLabStoreTest {
    @TempDir Path directory;

    @Test
    void postsAndCommentsPersistAfterRestart() throws Exception {
        String file = directory.resolve("mural.properties").toString();
        MuralLabStore first = new MuralLabStore(file);
        var post = first.publish("Aviso de teste", "Conteúdo totalmente fictício.", "responsavel-lab", true);
        var comment = first.comment(post.id(), "Compreendido.", "colaborador-lab");
        first.setHidden(post.id(), comment.id(), true);
        var reloaded = new MuralLabStore(file).all();
        assertEquals(1, reloaded.size());
        assertEquals("Aviso de teste", reloaded.getFirst().title());
        assertEquals("responsavel-lab", reloaded.getFirst().author());
        assertTrue(reloaded.getFirst().comments().getFirst().hidden());
        assertEquals("colaborador-lab", reloaded.getFirst().comments().getFirst().author());
    }

    @Test
    void closedCommentsAndValidationCannotBeBypassed() throws Exception {
        var store = new MuralLabStore(directory.resolve("closed.properties").toString());
        var post = store.publish("Título válido", "Mensagem com conteúdo.", "responsavel-lab", false);
        assertThrows(ResponseStatusException.class,
            () -> store.comment(post.id(), "Tentar comentar", "colaborador-lab"));
        assertThrows(ResponseStatusException.class,
            () -> store.publish("abc", "Mensagem de teste válida.", "responsavel-lab", true));
        assertThrows(ResponseStatusException.class,
            () -> store.publish("Título válido", "Informe sua senha em https://dominio.exemplo", "responsavel-lab", true));
        store.setCommentsAllowed(post.id(), true);
        assertEquals(1, store.comment(post.id(), "Agora posso comentar.", "colaborador-lab").id());
    }

    @Test
    void removalIsPersistedAndMissingIdsAreRejected() throws Exception {
        String file = directory.resolve("remove.properties").toString();
        var store = new MuralLabStore(file);
        long id = store.publish("Título de exemplo", "Conteúdo fictício aprovado.", "responsavel-lab", true).id();
        assertThrows(ResponseStatusException.class, () -> store.setHidden(id, 999, true));
        store.remove(id);
        assertTrue(new MuralLabStore(file).all().isEmpty());
        assertThrows(ResponseStatusException.class, () -> store.comment(id, "Novo comentário", "colaborador-lab"));
    }

    @Test
    void newestPostComesFirstAndIdsRemainStable() throws Exception {
        String file = directory.resolve("order.properties").toString();
        var store = new MuralLabStore(file);
        var first = store.publish("Primeiro aviso", "Conteúdo fictício um.", "responsavel-lab", true);
        var second = store.publish("Segundo aviso", "Conteúdo fictício dois.", "responsavel-lab", true);
        assertEquals(second.id(), store.all().getFirst().id());
        store.remove(first.id());
        var third = new MuralLabStore(file).publish("Terceiro aviso", "Conteúdo fictício três.", "responsavel-lab", true);
        assertTrue(third.id() > second.id());
    }
}
