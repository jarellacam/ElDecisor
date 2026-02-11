from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def lectura_raiz():
    return {"mensaje": "Bienvenido a la API de EL DECISOR", "estado": "funcional"}

@app.get("/ping")
def pong():
    return {"pong": True}