import re

# Algoritmo KMP
def kmp_search(text, pattern):
    n = len(text)
    m = len(pattern)
    lps = [0] * m
    j = 0  # index for pattern
    compute_lps_array(pattern, m, lps)
    
    i = 0  # index for text
    result = []
    while i < n:
        if pattern[j] == text[i]:
            i += 1
            j += 1

        if j == m:
            result.append(i - j)
            j = lps[j - 1]
        elif i < n and pattern[j] != text[i]:
            if j != 0:
                j = lps[j - 1]
            else:
                i += 1
    return result

def compute_lps_array(pattern, m, lps):
    length = 0
    i = 1
    while i < m:
        if pattern[i] == pattern[length]:
            length += 1
            lps[i] = length
            i += 1
        else:
            if length != 0:
                length = lps[length - 1]
            else:
                lps[i] = 0
                i += 1

# Algoritmo LCS
def lcs(texto1, texto2):
    m = len(texto1)
    n = len(texto2)
    lcs_matrix = [[0] * (n + 1) for _ in range(m + 1)]
    longitud_max = 0
    fin_idx = 0
    
    # Construir la matriz LCS
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if texto1[i - 1] == texto2[j - 1]:
                lcs_matrix[i][j] = lcs_matrix[i - 1][j - 1] + 1
                if lcs_matrix[i][j] > longitud_max:
                    longitud_max = lcs_matrix[i][j]
                    fin_idx = i
            else:
                lcs_matrix[i][j] = 0
    
    # Recuperar la subcadena común más larga
    if longitud_max > 0:
        return texto1[fin_idx - longitud_max: fin_idx]
    else:
        return ""


def preprocess_text(text):
    # Guardar solo caracteres alfabéticos y devolver el mapeo de los índices al texto original
    filtered_text = []
    mapping = []  # Mapea el índice en el texto filtrado al índice en el texto original
    for i, char in enumerate(text):
        if char.isalpha():  # Solo considerar letras
            filtered_text.append(char.lower())  # Convertir a minúsculas para evitar problemas con mayúsculas
            mapping.append(i)
    
    return ''.join(filtered_text), mapping

def manacher(text):
    # Preprocesa el texto para eliminar espacios y caracteres no alfabéticos
    processed_text, mapping = preprocess_text(text)
    
    # Preproceso del texto para manejar palíndromos de longitud par e impar
    T = '#'.join(f'^{processed_text}$')
    n = len(T)
    P = [0] * n  # Arreglo para almacenar el radio de los palíndromos
    C = R = 0  # Centro y radio más grandes
    
    for i in range(1, n - 1):
        P[i] = (R > i) and min(R - i, P[2 * C - i])  # Mirar el espejo del centro C
        while T[i + 1 + P[i]] == T[i - 1 - P[i]]:
            P[i] += 1
        if i + P[i] > R:
            C, R = i, i + P[i]
    
    # Encontrar el palíndromo más grande en el texto procesado
    max_len, center_index = max((n, i) for i, n in enumerate(P))
    start = (center_index - max_len) // 2  # Índice inicial en el texto procesado
    
    # Mapeamos los índices del texto procesado al texto original
    palindromo_start = mapping[start]
    palindromo_end = mapping[start + max_len - 1]
    
    return text[palindromo_start:palindromo_end + 1]


# Implementación de Tries
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True

    def search_prefix(self, prefix):
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        return self._words_with_prefix(node, prefix)

    def _words_with_prefix(self, node, prefix):
        results = []
        if node.is_end_of_word:
            results.append(prefix)
        for char, next_node in node.children.items():
            results.extend(self._words_with_prefix(next_node, prefix + char))
        return results
