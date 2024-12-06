document.addEventListener('DOMContentLoaded', function () {
    var formData = JSON.parse(localStorage.getItem("formData"));
    // var situacoesAprendizagem = parseInt(formData.situAprendizagem);
    var horasRestantes = parseInt(localStorage.getItem("horasRestantes"));
    var situacaoAtual = parseInt(localStorage.getItem("situacaoAtual"));
    var totalHorasUC = parseInt(formData.ch);

    if (!horasRestantes || isNaN(horasRestantes)) {
        horasRestantes = totalHorasUC;
        localStorage.setItem("horasRestantes", horasRestantes.toString());
    }

    document.getElementById("situacaoTitle").textContent = `Situação de Aprendizagem ${situacaoAtual}`;
    
    var horasRestantesDiv = document.createElement('div');
    horasRestantesDiv.className = 'horas-restantes-info';
    horasRestantesDiv.style.marginBottom = '20px';
    horasRestantesDiv.style.padding = '10px';
    horasRestantesDiv.style.backgroundColor = '#f0f0f0';
    horasRestantesDiv.style.borderRadius = '5px';
    horasRestantesDiv.style.textAlign = 'center';
    horasRestantesDiv.innerHTML = `<strong>Horas restantes para distribuir:</strong> ${horasRestantes}h`;

    var form = document.getElementById("situacaoForm");
    form.insertBefore(horasRestantesDiv, form.firstChild);


    document.getElementById("nAulas").addEventListener('change', function(e){
        var valorInserido = parseInt(e.target.value);
        if (isNaN(valorInserido) || valorInserido <= 0) {
            alert("Por favor, insira um valor válido maior que 0.");
            e.target.value = "";
            return;
        }

        if (valorInserido > totalHorasUC) {
            alert(`A carga horária não pode exceder o total da UC (${totalHorasUC}h)`);
            e.target.value = totalHorasUC;
            return;
        }

        if (valorInserido > horasRestantes) {
            alert(`A carga horária não pode exceder as horas restantes (${horasRestantes}h)`);
            e.target.value = horasRestantes;
        }
    });

    function handleTextareaInput(event) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }


    document.querySelectorAll('textarea[data-auto-expand]').forEach(textarea => {
        textarea.addEventListener('input', handleTextareaInput);
        handleTextareaInput({ target: textarea });
    });

    document.getElementById("backButton").addEventListener('click', function(event) {
        event.preventDefault();
        
        // Save current form data before going back
        var currentFormData = {
            nomeSituacao: document.getElementById("nomeSituacao").value,
            quantidadeAulas: document.getElementById("nAulas").value,
            indicadores: document.getElementById("indicadores").value,
            conhecimentos: document.getElementById('conhecimentos').value,
            habilidades: document.getElementById('habilidades').value,
            atitudes: document.getElementById('atitudes').value,
            contexto: document.getElementById("contexto").value,
            marcasFormativas: Array.from(document.querySelectorAll('input[name="marcasFormativas"]:checked')).map(cb => cb.value),
        };

        var todasSituacoes = JSON.parse(localStorage.getItem("todasSituacoes")) || [];
        todasSituacoes[situacaoAtual - 1] = currentFormData;
        localStorage.setItem("todasSituacoes", JSON.stringify(todasSituacoes));

       
        window.location.href = "index.html";
    });

    document.getElementById("situacaoForm").addEventListener('submit', function(event) {
        event.preventDefault();

        var horasUtilizadas = parseInt(document.getElementById("nAulas").value);

        if (isNaN(horasUtilizadas) || horasUtilizadas <= 0) {
            alert("Por favor, insira um valor válido para as horas.");
            return;
        }

        var novasHorasRestantes = horasRestantes - horasUtilizadas;
        if (novasHorasRestantes < 0) {
            alert("A distribuição de horas excede o total disponível.");
            return;
        }

        horasRestantes = novasHorasRestantes;
        localStorage.setItem("horasRestantes", horasRestantes.toString());

        
        var checkboxes = document.querySelectorAll('input[name="marcasFormativas"]:checked');
        if (checkboxes.length === 0) {
            alert("Por favor, selecione pelo menos uma Marca Formativa antes de avançar.");
            return;
        }

        var situacaoData = {
            nomeSituacao: document.getElementById("nomeSituacao").value,
            quantidadeAulas: horasUtilizadas,
            indicadores: document.getElementById("indicadores").value,
            conhecimentos: document.getElementById('conhecimentos').value,
            habilidades: document.getElementById('habilidades').value,
            atitudes: document.getElementById('atitudes').value,
            contexto: document.getElementById("contexto").value,
            marcasFormativas: Array.from(checkboxes).map(cb => cb.value),
        };

        var todasSituacoes = JSON.parse(localStorage.getItem("todasSituacoes")) || [];
        todasSituacoes[situacaoAtual - 1] = situacaoData;
        localStorage.setItem("todasSituacoes", JSON.stringify(todasSituacoes));

        window.location.href = "pdf.html";
    });
});
