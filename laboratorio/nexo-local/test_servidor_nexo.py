"""Testes HTTP reais, sem modelos de IA nem dados institucionais."""
import http.client
import json
import threading
import unittest
from http.server import ThreadingHTTPServer
from unittest.mock import patch

import servidor_nexo as srv


class PonteLocalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), srv.Handler)
        cls.worker = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.worker.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.worker.join(timeout=3)

    def request(self, method, path="/chat", data=None, origin="http://127.0.0.1:18081", headers=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        hdr = {"Origin": origin}
        if headers:
            hdr.update(headers)
        if isinstance(data, dict):
            data = json.dumps(data, ensure_ascii=False).encode("utf-8")
            hdr["Content-Type"] = "application/json"
        conn.request(method, path, data, hdr)
        response = conn.getresponse()
        body = response.read()
        result = (response.status, dict(response.getheaders()), json.loads(body) if body else {})
        conn.close()
        return result

    def test_somente_browser_local_tem_acesso(self):
        for origin in ["https://unihorizontes.br", "http://localhost:3000", "null", ""]:
            status, headers, _ = self.request("POST", data={"pergunta": "oi"}, origin=origin)
            self.assertEqual(status, 403)
            self.assertNotIn("Access-Control-Allow-Origin", headers)

    def test_preflight_restrito(self):
        status, headers, _ = self.request("OPTIONS")
        self.assertEqual(status, 204)
        self.assertEqual(headers["Access-Control-Allow-Origin"], "http://127.0.0.1:18081")
        self.assertEqual(self.request("OPTIONS", origin="https://example.org")[0], 403)

    def test_health_nao_promete_dados_reais(self):
        status, _, body = self.request("GET", "/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "laboratorio_local")
        self.assertIs(body["conexao_institucional"], False)
        self.assertIs(body["persistencia"], False)

    @patch.object(srv, "responder", return_value=("Outubro sem leitura.", ["Demonstrativo"], ["consultar_impressoes"]))
    def test_resposta_traz_fonte_e_ferramenta(self, fake):
        status, headers, body = self.request("POST", data={"pergunta": "Qual o consumo de outubro?"})
        self.assertEqual(status, 200)
        self.assertEqual(body["resposta"], "Outubro sem leitura.")
        self.assertEqual(body["fontes"], ["Demonstrativo"])
        self.assertEqual(body["ferramentas"], ["consultar_impressoes"])
        self.assertIs(body["dados_reais"], False)
        self.assertEqual(headers["Cache-Control"], "no-store")
        fake.assert_called_once()

    @patch.object(srv, "responder")
    def test_recusa_campos_sensiveis_e_entrada_invalida(self, fake):
        for text in ("", "x"*281, "Minha senha é 123"):
            self.assertEqual(self.request("POST", data={"pergunta": text})[0], 400)
        self.assertEqual(self.request("POST", data={"outro": "valor"})[0], 400)
        fake.assert_not_called()

    @patch.object(srv, "responder", None)
    def test_sem_agente_retorna_503(self):
        self.assertEqual(self.request("POST", data={"pergunta": "Olá"})[0], 503)

    @patch.object(srv, "responder", side_effect=TimeoutError)
    def test_erro_ia_retorna_503(self, fake):
        self.assertEqual(self.request("POST", data={"pergunta": "Explique IA"})[0], 503)


if __name__ == "__main__":
    unittest.main()
