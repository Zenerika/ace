/* AJAX Dynamic Drop-Down */

function init() {
    var url = 'api/breed.php?q={input}'
    var widget = new AutoComplete('breedInput', url)

}

$(document).ready(init)



