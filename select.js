// select.js

document.addEventListener('DOMContentLoaded', function() {
    let baseDados;

    // Carregar o arquivo JSON
    fetch('baseDados.json')
        .then(response => response.json())
        .then(data => {
            baseDados = data;
            populateEixos();
        });

    //pegar os elementos do HTML
    const eixoSelect = document.getElementById('eixo');
    const segmentoSelect = document.getElementById('segmento');
    const courseSelect = document.getElementById('course');
    const tipoSelect = document.getElementById('tipo');
    const workloadSelect = document.getElementById('workload');

    //função para popular os eixos
    function populateEixos() {
        const eixos = [...new Set(baseDados.map(item => item.Eixo))];
        eixos.forEach(eixo => {
            const option = document.createElement('option');
            option.value = eixo;
            option.textContent = eixo;
            eixoSelect.appendChild(option);
        });

        // Restaura os valores dos selects após populá-los
        restoreSelectValues();
    }

    // Restaura os valores dos selects se existirem no localStorage
    function restoreSelectValues() {
        const savedData = JSON.parse(localStorage.getItem("formData"));
        if (savedData) {
            eixoSelect.value = savedData.eixo;

            // Popula segmentos com o eixo salvo
            const segmentos = [...new Set(baseDados.filter(item => item.Eixo === savedData.eixo).map(item => item.Segmento))];
            segmentos.forEach(segmento => {
                const option = document.createElement('option');
                option.value = segmento;
                option.textContent = segmento;
                segmentoSelect.appendChild(option);
            });

            segmentoSelect.value = savedData.segmento;

            // Popula cursos com o eixo e segmento salvos
            const cursos = baseDados.filter(item => item.Eixo === savedData.eixo && item.Segmento === savedData.segmento);
            cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.Curso;
                option.textContent = curso.Curso;
                courseSelect.appendChild(option);
            });

            courseSelect.value = savedData.curso;

            // Popula tipos com o curso salvo
            const cursoSelecionado = baseDados.find(item => item.Eixo === savedData.eixo && item.Segmento === savedData.segmento && item.Curso === savedData.curso);
            if (cursoSelecionado) {
                const tipoOption = document.createElement('option');
                tipoOption.value = cursoSelecionado.Tipo;
                tipoOption.textContent = cursoSelecionado.Tipo;
                tipoSelect.appendChild(tipoOption);

                // Configura a carga horária se houver
                workloadSelect.value = cursoSelecionado["Carga Horária do Curso:"] || '';
            }

            tipoSelect.value = savedData.tipo;
        }
    }

    // Adicionando lógica de mudança de seleção
    eixoSelect.addEventListener('change', function() {
        const selectedEixo = this.value;
        const segmentos = [...new Set(baseDados.filter(item => item.Eixo === selectedEixo).map(item => item.Segmento))];
        
        segmentoSelect.innerHTML = '<option value="">Selecione o segmento...</option>';
        segmentos.forEach(segmento => {
            const option = document.createElement('option');
            option.value = segmento;
            option.textContent = segmento;
            segmentoSelect.appendChild(option);
        });

        // Limpar os selects de curso, tipo e carga horária
        courseSelect.innerHTML = '<option value="">Selecione o curso...</option>';
        tipoSelect.innerHTML = '<option value="">Selecione o tipo de curso...</option>';
        workloadSelect.value = ''; // Limpar o campo de carga horária
    });

    segmentoSelect.addEventListener('change', function() {
        const selectedEixo = eixoSelect.value;
        const selectedSegmento = this.value;
        const cursos = baseDados.filter(item => item.Eixo === selectedEixo && item.Segmento === selectedSegmento);

        courseSelect.innerHTML = '<option value="">Selecione o curso...</option>';
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso.Curso;
            option.textContent = curso.Curso;
            courseSelect.appendChild(option);
        });

        // Limpar os selects de tipo e carga horária
        tipoSelect.innerHTML = '<option value="">Selecione o tipo de curso...</option>';
        workloadSelect.value = ''; // Limpar o campo de carga horária
    });

    courseSelect.addEventListener('change', function() {
        const selectedEixo = eixoSelect.value;
        const selectedSegmento = segmentoSelect.value;
        const selectedCurso = this.value;
        const curso = baseDados.find(item => item.Eixo === selectedEixo && item.Segmento === selectedSegmento && item.Curso === selectedCurso);

        tipoSelect.innerHTML = '<option value="">Selecione o tipo de curso...</option>';
        const workloadInput = document.getElementById('workload');
        workloadInput.value = '';

        if (curso) {
            const tipoOption = document.createElement('option');
            tipoOption.value = curso.Tipo;
            tipoOption.textContent = curso.Tipo;
            tipoSelect.appendChild(tipoOption);

            if (curso["Carga Horária do Curso:"]) {
                workloadInput.value = curso["Carga Horária do Curso:"];
            }
        }
    });
});
