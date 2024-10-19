from flask import Flask, render_template, request, jsonify
import os
from algorithms import kmp_search, lcs, manacher, Trie

app = Flask(__name__)

# Ruta principal para cargar la aplicación
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/buscar', methods=['POST'])
def buscar():
    texto = request.form['texto']
    patron = request.form['patron']
    
    # Verificar los valores que llegan al servidor
    print(f"Texto recibido: {texto}")
    print(f"Patrón recibido: {patron}")
    
    try:
        # Verificar que kmp_search esté devolviendo un resultado
        resultado = kmp_search(texto, patron)
        print(f"Resultado de kmp_search: {resultado}")
        
        # Asegurarse de que se devuelva JSON
        return jsonify(resultado)
    except Exception as e:
        # Si hay un error, imprimirlo y devolver un error
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.errorhandler(500)
def handle_internal_error(e):
    return jsonify({"error": "Error interno del servidor"}), 500


# Ruta para calcular similitud entre dos textos
@app.route('/similitud', methods=['POST'])
def similitud():
    texto1 = request.form['texto1']
    texto2 = request.form['texto2']
    
    # Lógica para encontrar la subcadena común más larga (LCS)
    resultado_lcs = lcs(texto1, texto2)  # Implementa el algoritmo LCS

    # Devuelve la subcadena común más larga en formato JSON
    return jsonify(resultado_lcs)

# Ruta para buscar el palíndromo más grande
@app.route('/palindromo', methods=['POST'])
def palindromo():
    texto = request.form['texto']  # Obtener el texto desde el formulario
    resultado = manacher(texto)  # Aplicar el algoritmo de Manacher
    return jsonify(resultado)  # Devolver el palíndromo más largo en formato JSON


# Ruta para autocompletado usando Tries
@app.route('/autocomplete', methods=['POST'])
def autocomplete():
    texto = request.form['texto']
    trie = Trie()
    # Agregamos las palabras al Trie
    for palabra in texto.split():
        trie.insert(palabra)
    prefix = request.form['prefix']
    sugerencias = trie.search_prefix(prefix)  # Autocompletar según el prefijo
    return jsonify(sugerencias)

if __name__ == '__main__':
    app.run(debug=True)
