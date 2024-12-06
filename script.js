
document.addEventListener('DOMContentLoaded', function () {

    if (!sessionStorage.getItem('sessionActive')) {
        localStorage.clear();
        sessionStorage.setItem('sessionActive', 'true');
    }

    document.getElementById("ch").value = '';
    document.getElementById("situAprendizagem").value = '';
function setupForm() {
    // Carregar dados salvos no localStorage, se existirem
    var savedFormData = localStorage.getItem("formData");
    if (savedFormData) {
        var formData = JSON.parse(savedFormData);
        document.getElementById("eixo").value = formData.eixo;
        document.getElementById("segmento").value = formData.segmento;
        document.getElementById("course").value = formData.curso;
        document.getElementById("tipo").value = formData.tipo;
        document.getElementById("workload").value = formData.cargaHoraria;
        document.getElementById("uc").value = formData.uc;
        document.getElementById("ch").value = formData.ch;
        document.getElementById("situAprendizagem").value = formData.situAprendizagem;
    }

    // Listener para o evento de submit
    document.getElementById("courseForm").addEventListener('submit', function(event) {
        event.preventDefault();

        var formData = {
            curso: document.getElementById("course").value,
            cargaHoraria: document.getElementById("workload").value,
            eixo: document.getElementById("eixo").value,
            segmento: document.getElementById("segmento").value,
            tipo: document.getElementById("tipo").value,
            uc: document.getElementById("uc").value,
            ch: document.getElementById("ch").value,
            situAprendizagem: document.getElementById("situAprendizagem").value,
        };

        localStorage.setItem("formData", JSON.stringify(formData));
        localStorage.setItem("situacaoAtual", "1");
        localStorage.setItem("todasSituacoes", JSON.stringify([]));
        localStorage.setItem("respostasSituacoes", JSON.stringify({}));
        localStorage.setItem("horasRestantes", formData.ch);

        window.location.href = "situacao.html";
    });
}

setupForm();

});