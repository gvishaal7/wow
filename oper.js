$(document).on("click","#guild_submit",function(event) {
    var guild_name = document.getElementById("guild_name").value;
    $.ajax({
        url : "http://localhost:8123/myForm",
        method : "GET",
        data : {name : guild_name}
    }).done(function(data){
        $("#res").empty();
        $("#res").append(data);
    }).fail(function() {
        alert("Error while connecting to the backend");
    });
    event.preventDefault();
    console.log("here");
});