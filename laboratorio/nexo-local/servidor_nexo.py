"""Ponte opcional para o Nexo no navegador — SOMENTE laboratório local.

Utiliza o nexo_unh.py já instalado pela usuária em ~/Nexo-Lab.
Não abrir portas em rede institucional, não enviar dados reais/sensíveis.
"""
import json
import re
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError, URLError

sys.path.insert(0, str(Path.home() / "Nexo-Lab"))
try:
    from nexo_unh import responder
except ImportError:
    responder = None

HOST = "127.0.0.1"
PORT = 18767
ORIGENS = frozenset(
    f"http://{host}:{port}"
    for host in ("127.0.0.1", "localhost")
    for port in (18081, 8080)
)

class Handler(BaseHTTPRequestHandler):
    server_version = "NexoUNHLab/1"
    sys_version = ""

    def log_message(self, fmt, *args):
        # Não registrar mensagens, dados pessoais ou acessos em logs.
        pass

    def json(self, status, payload, origin=None):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if origin in ORIGENS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Vary", "Origin")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        origin = self.headers.get("Origin")
        if self.path != "/chat" or origin not in ORIGENS:
            self.json(403, {"erro": "Origem não autorizada"})
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def do_GET(self):
        origin = self.headers.get("Origin")
        if self.path != "/health":
            self.json(404, {"erro": "Rota inexistente"})
        elif origin not in ORIGENS:
            self.json(403, {"erro": "Origem não autorizada"})
        else:
            self.json(200, {"status": "laboratorio_local", "conexao_institucional": False,
                            "persistencia": False, "agente_disponivel": responder is not None}, origin)

    def do_POST(self):
        origin = self.headers.get("Origin")
        if self.path != "/chat":
            self.json(404, {"erro": "Rota inexistente"})
            return
        if origin not in ORIGENS:
            self.json(403, {"erro": "Origem não autorizada"})
            return
        if self.headers.get("Content-Type", "").split(";", 1)[0].strip().lower() != "application/json":
            self.json(415, {"erro": "Somente JSON"}, origin)
            return
        try:
            size = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            size = 0
        if not 0 < size <= 2048:
            self.json(413, {"erro": "Requisição vazia ou muito grande"}, origin)
            return
        try:
            data = json.loads(self.rfile.read(size))
        except (ValueError, UnicodeDecodeError):
            self.json(400, {"erro": "JSON inválido"}, origin)
            return
        question = data.get("pergunta") if isinstance(data, dict) else None
        if not isinstance(question, str) or not 0 < len(question.strip()) <= 280:
            self.json(400, {"erro": "Pergunta obrigatória (até 280 caracteres)"}, origin)
            return
        question = question.strip()
        # Filtragem básica apenas; NÃO é mecanismo de proteção de dados.
        if re.search(r"\b(cpf|senha|password|token|credenciais?|matr[ií]cula|prontu[aá]rio)\b", question, re.I):
            self.json(400, {"erro": "Não envie dados pessoais ou credenciais ao laboratório."}, origin)
            return
        if responder is None:
            self.json(503, {"erro": "Arquivo nexo_unh.py não encontrado em ~/Nexo-Lab"}, origin)
            return
        try:
            start = time.monotonic()
            answer, sources, tools = responder(question)
            self.json(200, {"resposta": answer[:6000], "fontes": sources[:8],
                            "ferramentas": tools[:4],
                            "duracao_s": round(time.monotonic()-start, 1),
                            "modo": "laboratorio_local", "dados_reais": False}, origin)
        except (HTTPError, URLError, TimeoutError, KeyError, ValueError, OSError):
            self.json(503, {"erro": "Ollama indisponível ou retorno inválido."}, origin)


def main():
    print(f"Ponte Nexo laboratório: http://{HOST}:{PORT}")
    print("Somente localhost nas portas 18081/8080; não usa dados institucionais.")
    print("Mantenha a janela aberta. Ctrl+C para encerrar.")
    httpd = ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    main()
