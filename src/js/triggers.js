
function readURL(input) {
    console.log("file!",input);
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log("image Onload", e.target.result);
       
        };
        reader.readAsDataURL(input.files[0]);
    }
}