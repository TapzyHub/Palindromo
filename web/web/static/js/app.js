window.onload = function() {
     // Cargar el archivo en el primer div editable
     document.getElementById('fileInput1').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                document.getElementById('fileContent').textContent = content;  // Mostrar el contenido en el primer div
                console.log("Contenido del archivo 1 cargado:", content);
            };
            reader.readAsText(file);
        }
    });

    // Cargar el segundo archivo en el segundo div
    document.getElementById('fileInput2').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                document.getElementById('fileContent2').textContent = content;  // Mostrar el contenido en el segundo div
                console.log("Contenido del archivo 2 cargado:", content);

                // Habilitar el botón de similitud después de cargar el segundo archivo
                document.getElementById('similarityBtn').disabled = false;
            };
            reader.readAsText(file);
        } else {
            console.log("No se seleccionó un archivo para el segundo archivo.");
        }
    });

    document.getElementById('searchBtn').addEventListener('click', function () {
        let pattern = document.getElementById('searchPattern').value;
        let text = document.getElementById('fileContent').textContent;  // Cambiar .value a .textContent
    
        console.log("Patrón:", pattern);
        console.log("Texto:", text);
    
        fetch('http://127.0.0.1:5000/buscar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `texto=${encodeURIComponent(text)}&patron=${encodeURIComponent(pattern)}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();  // Aquí esperamos una respuesta JSON
        })
        .then(data => {
            console.log("Posiciones:", data);
            highlightPattern(text, pattern, data);  // Resalta las coincidencias
        })
        .catch(error => {
            console.error('Error al procesar la respuesta:', error);
        });
    });
    
    
    

    // Evento para el botón de Similitud (LCS)
    document.getElementById('similarityBtn').addEventListener('click', function () {
        let text1 = document.getElementById('fileContent').textContent;  // Obtener el primer texto
        let text2 = document.getElementById('fileContent2').textContent;  // Obtener el segundo texto
    
        console.log("Texto 1:", text1);
        console.log("Texto 2:", text2);
    
        // Asegúrate de que ambos textos se están obteniendo correctamente
        if (!text1 || !text2) {
            alert("Ambos archivos deben estar cargados para comparar similitudes.");
            return;
        }
    
        // Realizar la solicitud al backend para encontrar la similitud
        fetch('http://127.0.0.1:5000/similitud', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `texto1=${encodeURIComponent(text1)}&texto2=${encodeURIComponent(text2)}`
        })
        .then(response => response.json())
        .then(similitud => {
            console.log("Similitud encontrada:", similitud);
            highlightSimilarity(text1, text2, similitud);  // Resaltar la similitud en ambos textos
        })
        .catch(error => {
            console.error('Error al obtener la similitud:', error);
        });
    });

    document.getElementById('palindromeBtn').addEventListener('click', function () {
        let text = document.getElementById('fileContent').textContent;  // Asegúrate de obtener el texto correctamente
    
        // Hacer la solicitud al backend Flask
        fetch('/palindromo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `texto=${encodeURIComponent(text)}`,  // Enviar el texto al backend
        })
        .then(response => response.json())
        .then(data => {
            console.log("Palíndromo más grande encontrado:", data);  // Imprime el resultado en la consola
            highlightPalindrome(text, data);  // Resaltar el palíndromo más largo en el texto cargado
        })
        .catch(error => {
            console.error('Error al obtener el palíndromo:', error);  // Maneja cualquier error en la consola
        });
    });
    
    

    // Autocompletar usando Tries
    document.getElementById('autocompleteInput').addEventListener('input', function () {
        let prefix = this.value;
        let text = document.getElementById('fileContent').textContent;

        fetch('/autocomplete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `texto=${encodeURIComponent(text)}&prefix=${encodeURIComponent(prefix)}`,
        })
        .then(response => response.json())
        .then(data => {
            showAutocompleteSuggestions(data);
        });
    });

    // Función para resaltar las coincidencias del patrón
    function highlightPattern(text, pattern, positions) {
        // Crear un arreglo de caracteres del texto
        let textArray = text.split("");
    
        // Iterar sobre las posiciones de mayor a menor
        positions.sort((a, b) => b - a);
    
        // Insertar marcadores para resaltado
        positions.forEach(position => {
            // Insertamos los marcadores de cierre primero para no afectar las posiciones
            textArray.splice(position + pattern.length, 0, "</span>");
            textArray.splice(position, 0, "<span class='highlight-yellow'>");
        });
    
        // Unimos el arreglo de texto en una sola cadena de nuevo
        const highlightedText = textArray.join("");
    
        // Establecemos el contenido del div con el texto resaltado
        document.getElementById('fileContent').innerHTML = highlightedText;
    }
    
    function highlightSimilarity(text1, text2, similarity) {
        // Resaltar la similitud en azul en el primer texto
        document.getElementById('fileContent').innerHTML = text1.replace(similarity, `<span class="highlight-blue">${similarity}</span>`);
    
        // Resaltar la similitud en azul en el segundo texto
        document.getElementById('fileContent2').innerHTML = text2.replace(similarity, `<span class="highlight-blue">${similarity}</span>`);
    }
    

    // Función para resaltar el palíndromo más largo (Manacher)
    function highlightPalindrome(text, palindrome) {
        document.getElementById('fileContent').innerHTML = text.replace(palindrome, `<span class="highlight-green">${palindrome}</span>`);
    }
    

    // Función para mostrar sugerencias de autocompletar
    function showAutocompleteSuggestions(suggestions) {
        let suggestionBox = document.getElementById('autocompleteSuggestions');
        suggestionBox.innerHTML = "";
        suggestions.forEach(suggestion => {
            let div = document.createElement('div');
            div.innerText = suggestion;
            div.addEventListener('click', function () {
                document.getElementById('autocompleteInput').value = suggestion;
                suggestionBox.innerHTML = "";
            });
            suggestionBox.appendChild(div);
        });
    }
};
