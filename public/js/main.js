
$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();
  /*Delete story post*/
  $('.btn-delete').on('click', function(e){
    let $target = $(e.target);
    const id = $target.attr('data-id');
    $.ajax({
      type: 'DELETE',
      url: '/blog/'+id,
      success: function(response){
        window.location.href='/';
      },
      error: function(err){
        console.log(err);
      }
    });
  });

  /*Delete Quote post*/
    $('.btn-ok').on('click', function(e) {
      let $target = $(e.target);
        let id = $target.attr('data-id');
        $.ajax({
          type: 'DELETE',
          url: '/quote/'+id,
          success: function(response){
            window.location.href='/';
          },
          error: function(err){
            console.log(err);
          }
        });
    });
   

  $( ".fa-caret-down" ).click( function() {
        $(".fa-caret-down").toggleClass('flip');
  });

  $('.fade-in').addClass('animated pulse');
  $('.greet').addClass('animated fadeInDown');

});

