function changeDate() {
    let v = document.getElementById('sd');
    v.value = new Date().toISOString().slice(0,10);
}

$(document).ready(
    function () {
        changeDate();
    }
);