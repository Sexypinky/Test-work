$(function(){
  
  function set(key, value) { localStorage.setItem(key, value); }
  function get(key)        { return localStorage.getItem(key); }
  function increase(el)    { set(el, parseInt( get(el) ) + 1); }
  function decrease(el)    { set(el, parseInt( get(el) ) - 1); }

  var toTime = function(nr){
    if(nr == '-:-') return nr;
    else { var n = ' '+nr/1000+' '; return n.substr(0, n.length-1)+'s'; }
  };

 

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
  };

  function startScreen(text){
    $('#g').removeAttr('class').empty();
    $('.logo').fadeIn(250);

    $('.c1').text(text.substring(2, 3));
    $('.c2').text(text.substring(3, 4));

    // при выйгрыше
    if(text == 'nice'){
      increase('flip_won');
      decrease('flip_abandoned');
    }

    // при проигрыше
    else if(text == 'fail'){
      increase('flip_lost');
      decrease('flip_abandoned');
    }

 
  };



  if( !get('flip_won') && !get('flip_lost') && !get('flip_abandoned') ){

  }


  // начальный экран
  $('.logo .card:not(".twist")').on('click', function(e){
    $(this).toggleClass('active').siblings().not('.twist').removeClass('active');
    if( $(e.target).is('.playnow') ) { $('.logo .card').last().addClass('active'); }
  });

  // начало игры
  $('.play').on('click', function(){
    increase('flip_abandoned');
		$('.info').fadeOut();

    var difficulty = '',
        timer      = 1000,
        level      = $(this).data('level');

    // установка таймера   
    if     (level ==  8) { difficulty = 'casual'; timer *= level * 5; }  
	
    $('#g').addClass(difficulty);

    $('.logo').fadeOut(250, function(){
      var startGame  = $.now(),
          obj = [];

      // создание и перемешивание плиток
      for(i = 0; i < level; i++) { obj.push(i); }

      var shu      = shuffle( $.merge(obj, obj) ),
          cardSize = 100/Math.sqrt(shu.length);

      for(i = 0; i < shu.length; i++){
        var code = shu[i];
        if(code < 10) code = "0" + code;
        $('<div class="card" style="width:'+cardSize+'%;height:'+cardSize+'%;">'+
            '<div class="flipper"><div class="f"></div><div class="b" data-f="&#xf'+code+';"></div></div>'+
          '</div>').appendTo('#g');
      }

      // установка карточных экшенов
      $('#g .card').on({
        'mousedown' : function(){
          if($('#g').attr('data-paused') == 1) {return;}
          var data = $(this).addClass('active').find('.b').attr('data-f');

          if( $('#g').find('.card.active').length > 1){
            setTimeout(function(){
              var thisCard = $('#g .active .b[data-f='+data+']');

              if( thisCard.length > 1 ) {
                thisCard.parents('.card').toggleClass('active card found').empty();
                increase('flip_matched');

                // смарт скрин при победе
                if( !$('#g .card').length ){
                  var time = $.now() - startGame;
                  if( get('flip_'+difficulty) == '-:-' || get('flip_'+difficulty) > time ){
                    set('flip_'+difficulty, time); 
                  }

                  startScreen('niyw');
                }
              }
              else {
                $('#g .card.active').removeClass('active'); // fail
                increase('flip_wrong');
              }
            }, 401);
          }
        }
      });

      // таймер бар
      $('<i class="timer"></i>')
        .prependTo('#g')
        .css({
          'animation' : 'timer '+timer+'ms linear'
        })
        .one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(e) {
          startScreen('fayf'); // при проигрыше
        });

      // эшкны на паузы и выход
      $(window).off().on('keyup', function(e){
        // Pause game. (p)
        if(e.keyCode == 80){
          if( $('#g').attr('data-paused') == 1 ) { //продолжить
            $('#g').attr('data-paused', '0');
            $('.timer').css('animation-play-state', 'running');
            $('.pause').remove();
          }
          else {
            $('#g').attr('data-paused', '1');
            $('.timer').css('animation-play-state', 'paused');
            $('<div class="pause"></div>').appendTo('body');
          }
        }
        // выход из игры
        if(e.keyCode == 27){
          startScreen('flip');
          // если на паузе
          if( $('#g').attr('data-paused') == 1 ){
            $('#g').attr('data-paused', '0');
            $('.pause').remove();
          }
          $(window).off();
        }
      });
    });
  });
  
});