var socket = io();
var user;
var auctions;

$('#loginModal').modal({backdrop: 'static', keyboard: false})	

$('#login-form').submit(function(){
	$('#loginModal .error-message').text('')
	socket.emit('login', $('#username').val());
	return false;
})

function setBet(id){
	if($(`#${id}timer`).val() != "auction has closed")
		socket.emit('place-bet', {id: id, username: user, value: $(`#${id}value`).val()})
}

socket.on('authenticate', function(data){
	if(data.authenticated){
		user = data.username
		$.each($('.user'), function(index, value){
			value.innerHTML = data.username
		})
		$('#loginModal').modal('hide')
	} else {
		$('#loginModal .error-message').text('username already taken!')
	}
})

socket.on('feedback', function(data){
	console.log(data)
	$(`#${data.id} .your-bet`).removeClass('hidden')
	$(`#${data.id}`).addClass('bet')
	let unique = "Not unique"
	if(data.betsSet === 1)
		unique = "Unique"
	if(data.best)
		$(`#${data.id}`).addClass('win')
	else
		$(`#${data.id}`).removeClass('win')
	$(`#${data.id} .your-bet`).append(`<p data-value="${data.value}">€ ${data.value} <em>${unique}</em></p>`)
})

socket.on('auctions', function(data){
	auctions = data;
	$.each(auctions, function(index, value){
		$('#auctions').append(
			`<div id="${index}" class="third">
				<div class="thumbnail">
					<div class="mask">
			 		 <img class="col-sm-12" src="img/${value.name}.jpeg" alt="${value.name}">
			 		</div>
					<div class="caption clearfix">
						<div class="your-bet hidden"><strong>your bet</strong></div>
							<h3>${value.name}</h3>
							<p>Place your bet on the ${value.name}</p>
							<input readonly id="${index}timer" class="timer" ><br>
							<div class="col-lg-12">
								<div class="input-group">
									<input type="number" placeholder="1.00" step="0.01" id="${index}value" class="form-control">
									<span class="input-group-btn">
										<button class="btn btn-primary" onClick="setBet(${index})" type="button">Place bet</button>
									</span>
								</div>
							</div>
					</div>
				</div>
			</div>`
		);
	})
	$.each(auctions, function(index, value){
		initializeClock(index, value.endTime)
	})
})

socket.on('expired', function(data) {
	console.log(data)
	if(data.winner)
		$(`#${data.id}`).addClass("win")
	else
		$(`#${data.id}`).addClass("lose")
})

function logout(){
	socket.emit('logout', user)
	$('.user').text('guest')
	$('#loginModal').modal('show')
	$('#auctions').text('')
}

function initializeClock(id, endTime){
		auctions[id].timer = setInterval(function(){
		var t = getTimeRemaining(endTime);
		var clockValue = "";
		if(t.days != 0)
			clockValue += t.days	+ ' days,' + ' '
		if(t.hours != 0)
			clockValue += t.hours	 + 'h '
		if(t.minutes != 0)
			clockValue += t.minutes + 'm '
		if(t.total > 0)
			clockValue += t.seconds + 's';
		else {
			$(`#${id} button`).addClass("disabled")
			clockValue = "auction has closed"
		}
		
		$(`#${id}timer`).val(clockValue);

		if(t.total <= 0){
			clearInterval(auctions[id].timer);
		}
	},1000);
}

function getTimeRemaining(endTime){
	var t = Date.parse(endTime) - Date.parse(new Date());
	var seconds = Math.floor( (t/1000) % 60 );
	var minutes = Math.floor( (t/1000/60) % 60 );
	var hours = Math.floor( (t/(1000*60*60)) % 24 );
	var days = Math.floor( t/(1000*60*60*24) );
	return {
		'total': t,
		'days': days,
		'hours': hours,
		'minutes': minutes,
		'seconds': seconds
	};
}