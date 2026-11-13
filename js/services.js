angular.module('starter.services', [])

.service('registerUser', function($scope, CONF) {
	console.log($scope);	
	//var register
})

.service('jsUser', function(localStorage, G) {

	G.user = false;

	var setUser = function(r) {
		if(typeof(r) != 'undefined' && typeof(r.token) == 'string' && r.token.length && r.token.length > 1) {

			G.user = r;
			
			localStorage.set('jsUser', G.user);
			
			return true;
		}
		return false;
	};

	var isLogged = function() {
		try {
			var adm = window.localStorage.getItem('js_admin_auth_v1');
			if (adm) { var a = JSON.parse(adm); if (a && a.isAdmin === true) return true; }
			var prof = window.localStorage.getItem('js_user_profile_v1');
			if (prof) { var p = JSON.parse(prof); if (p && (p.cadastrado === true || p.isCadastrado === true || p.email)) return true; }
		} catch(e) {}
		var u = getUser();
		if(!u || typeof(u.token) == 'undefined' || (typeof(u.noRegistered) != 'undefined' && u.noRegistered == true)) return false;
		return true;
	};

	var getUser = function() {
		if(G.user == false) {
			G.user = localStorage.get('jsUser');
		}

		return G.user;
	};

	var logout = function() {
		G.user = false;
		localStorage.del('jsUser');
		localStorage.del('__appVarsTime');
		localStorage.del('__appVarsVars');		 
	};

	getUser();	

	var toReturn = {
		user: G.user,
		getUser: getUser,
		setUser: setUser,
		isLogged: isLogged,
		logout: logout
	};

	return toReturn;
})

.service('localStorage', function(){

	this.__localStorageCache = {};

  	this.set = function(key, value) {

  		this.__localStorageCache[key] = value;
		
		window.localStorage[key] = JSON.stringify(this.__localStorageCache[key]);
	};

	this.get = function(key) {
	  	
	  	if(typeof(this.__localStorageCache[key]) == 'undefined'){ 
	  		
	  		if(typeof(window.localStorage[key]) != 'undefined') {

	  			this.__localStorageCache[key] = JSON.parse(window.localStorage[key]);
	  		}

	  	}

	  	return this.__localStorageCache[key] || false;

	};

	this.del = function(key){
		window.localStorage.removeItem(key);
		delete this.__localStorageCache[key];
	};
})

.factory('DB', function() {
	return {
		db: { name: 'jsDb' },
		start: function() {
			console.log('DB instant start (Web mode)');
			return true;
		}
	};
})
.factory('Camera', ['$q', function($q) {

	return {
    	getPicture: function(options) {
		var q = $q.defer();
		navigator.camera.getPicture(
			function(result) {
        		q.resolve(result);
			}, function(err) {
        		q.reject(err);
      		}, options
		);
		
		return q.promise;
		
		}
	};

}])

.factory('webService', function($http, CONF, jsUser, localStorage, $ionicLoading, $rootScope, $q) {
	var rs = {
		call: function(r, showLoading) {

			var r = r || {};

			var showLoading = showLoading || false;			

			if(jsUser.getUser() && typeof(jsUser.getUser().token) != 'undefined') {
				r['jsToken'] = jsUser.getUser().token; 
			}

			var __appVarsTime = localStorage.get('__appVarsTime');

			r['__appVarsTime'] = (parseInt(__appVarsTime) > 0) ? __appVarsTime : 0;

			if(typeof(CONF.appVersionNumber) != 'undefined') {
				r['__appVersion'] = CONF.appVersionNumber;
			}

			if(ionic && ionic.Platform && typeof(ionic.Platform.platform()) == 'string'){
				r['__appPlatform'] = ionic.Platform.platform();
			}

			var httpConfig = {
				method: 'POST',
				url: CONF.webServiceUrl,
				data: r
			};

			if(showLoading) {

				$rootScope.webServiceLoading = true;
				//$ionicLoading.show({template: ' • • • ', noBackdrop: true, hideOnStateChange: true, duration: 20000});

				//$ionicLoading.show({template: '<ion-spinner icon="android"></ion-spinner>', noBackdrop: true, hideOnStateChange: true, duration: 20000});
				
				httpConfig.ionicLoadingToHide = showLoading;
			}	

			return $http(httpConfig);
		}
	};

	return rs;
})
.factory('jsNotify', function($ionicPlatform, jsUser, $state, $rootScope, webService, $ionicScrollDelegate, $ionicSideMenuDelegate, $ionicModal, $cordovaToast, $timeout, G, $http) {

	var OneSignalAlreadyStarted = false;

	var button = function(notify, buttonKey) {

		var toClose = true;
		var messageToast = false;
		
		var webServiceArgs = {
			op: 'notifyUpdate',
			notifyId: notify.notifyId,
			type: notify.type
		};

		if(notify && notify.buttons && notify.buttons[buttonKey] && notify.buttons[buttonKey]['type']) {

			if (jsUser.isLogged() == false) {
				$rootScope.checkUserRegister();
				return false;
			}
					
			var error = false;			

			webServiceArgs['buttonKey'] = buttonKey;
			webServiceArgs['buttonData'] = notify.buttons[buttonKey];

			var messageToast = (typeof(notify.buttons[buttonKey]['msgClk']) != 'undefined') ? notify.buttons[buttonKey]['msgClk'] : false;

			var notifyType = (typeof(notify.type[0]) != 'undefined') ? notify.type[0] : notify.type;

			if(notify && notify.type && notify.type[0] == 'pedrinha' && notify.type[1] == 'biblia' && (notify.buttons[buttonKey]['type'] == 'open' || notify.buttons[buttonKey]['type'] == 'close')) {
				$rootScope.estudoBiblicoAdd();
				$rootScope.jsTopContentShow = false;
				$rootScope.jsTopnotify = {};
				return true;
			}
			
			switch (notify.buttons[buttonKey]['type']) {
				
				case 'open':	

					if(notify.buttons[buttonKey]['action'] && notify.buttons[buttonKey]['action'][0] == 'state') {

						$rootScope.goState(notify.buttons[buttonKey]['action'][1], notify.buttons[buttonKey]['action'][2]);						

					} else if(notify['action'] && notify['action'][0] == 'state') {
						
						$rootScope.goState(notify['action'][1], notify['action'][2]);

					} else {
						error = true;
					}

					if(!messageToast && notifyType == 'pedrinha') {
						messageToast = 'Parabéns, você cumpriu uma pedrinha 😄';
					}

				break;

				case 'close':
					if(!messageToast && notifyType == 'pedrinha') {
						messageToast = 'Parabéns, você cumpriu uma pedrinha 😄';
					}
				break;

				case 'sched':
					toClose = false;					

					var dateHour = new Date();
					dateHour = 22 - dateHour.getHours();

					var scheduleShowOptions = [];
					scheduleShowOptions[0] = {name: '30 Minutos', value: '0.5', selected: true};

					for(var i = 1; i-1 < dateHour; i++) {
						scheduleShowOptions[i] = {name: i+' '+(i > 1 ? 'Horas' : 'Hora'), value: i};
					}
					
					$rootScope.jsTopnotify.scheduleShowSelected = scheduleShowOptions[0];
					$rootScope.jsTopnotify.scheduleShow = scheduleShowOptions;

				break;

				case 'schedAuto':
					messageToast = 'Voltaremos a lembrar você 😄';
				break;

				default:					
					error = true;
				break;
			}

			console.log('toClose', toClose);			

			if(error) {
				webServiceArgs.error = true;
			}						
		} else if(buttonKey == 'defaultClose') {
			webServiceArgs['buttonKey'] = buttonKey;
		} else {
			return false;
		}

		webService.call(webServiceArgs).then(function(r){ 
			console.log('button', r);
		});

		if(toClose) {
			$rootScope.jsTopContentShow = false;
			$rootScope.jsTopnotify = {};
			
			if(window.plugins && window.plugins.toast && messageToast){
				$cordovaToast.show(messageToast, 'long', 'bottom');
			}
		}
		return true;
	};
	$rootScope.jsTopnotifyButton = button;

	var buttonSchedule = function(selected, notify){
		
		var webServiceArgs = {
			op: 'notifyReschedule',
			notifyId: notify.notifyId,
			scheduleTime: selected.value
		};

		webService.call(webServiceArgs).then(function(r){ 
			console.log('buttonSchedule', r);
		});

		$rootScope.jsTopContentShow = false;
		$rootScope.jsTopnotify = {};
				
		if(window.plugins && window.plugins.toast){
			$cordovaToast.show('Relembraremos você, irmão 😄', 'long', 'bottom');
		}
	};

	$rootScope.jsTopnotifyButtonSchedule = buttonSchedule;

	var FB_FEED_NOTIFY_URL = 'https://jovens-sarados-app-default-rtdb.firebaseio.com/feed.json';

	var processarNotificacoesGerais = function(notifs) {
		// Ordena notificações pelas mais recentes primeiro
		notifs.sort(function(a, b) {
			return (b.dateTime || 0) - (a.dateTime || 0);
		});

		for (var i = 0; i < notifs.length; i++) {
			if (!notifs[i].imgThumb) {
				notifs[i].imgThumb = 'img/brand/insta-profile-logo.jpg';
			}
		}

		$rootScope.notifyTray = notifs;

		var lastRead = 0;
		try {
			lastRead = parseInt(localStorage.getItem('js_last_read_notify_ts') || '0', 10);
		} catch(e) {}

		var unreadCount = 0;
		for (var j = 0; j < notifs.length; j++) {
			var itemTs = notifs[j].dateTime || 0;
			if (itemTs > lastRead) {
				unreadCount++;
				notifs[j].isViewed = 0;
			} else {
				notifs[j].isViewed = 1;
			}
		}

		if (unreadCount > 0) {
			$rootScope.temNoticiaNova = true;
			$rootScope.notifyTrayNumber = unreadCount > 9 ? '9+' : unreadCount;
		} else {
			$rootScope.temNoticiaNova = false;
			$rootScope.notifyTrayNumber = false;
		}

		$timeout(function(){ updateNotifysTray(); }, 20000);
	};

	var updateNotifysTray = function() {
		webService.call({op: 'notifyGet'}).then(function(r){ 
			var notifs = (r && r.data && Array.isArray(r.data)) ? r.data.slice() : [];

			// Busca publicações do Feed no Firebase Realtime Database para gerar aviso no sininho
			$http.get(FB_FEED_NOTIFY_URL + '?_t=' + Date.now()).then(function(fbRes) {
				var fbData = fbRes.data || {};
				for (var k in fbData) {
					if (fbData.hasOwnProperty(k) && fbData[k]) {
						var post = fbData[k];
						var postTitle = (post.feedData && post.feedData.title) ? post.feedData.title.replace(/<[^>]+>/g, '').trim() : '';
						var postText = (post.feedData && post.feedData.text) ? post.feedData.text.trim() : '';
						var postImg = (post.feedData && (post.feedData.postImagem || post.feedData.imagem || post.feedData.videoImagem)) || 'img/brand/insta-profile-logo.jpg';

						notifs.push({
							id: 'feed-' + (post.id || k),
							feedId: post.id || k,
							title: postTitle || 'Nova Publicação no Feed!',
							titleInt: postTitle || 'Nova Publicação no Feed!',
							body: postText || 'Uma nova mensagem foi compartilhada com a comunidade.',
							imgThumb: postImg,
							dateTime: post.dateTime || Math.floor(Date.now() / 1000),
							badge: 'Novidade no Feed',
							tipo: 'feed'
						});
					}
				}
				processarNotificacoesGerais(notifs);
			}).catch(function() {
				processarNotificacoesGerais(notifs);
			});
		});
	};

	$rootScope.abrirNotificacoes = function() {
		try {
			localStorage.setItem('js_last_read_notify_ts', Math.floor(Date.now() / 1000));
		} catch(e) {}
		$rootScope.temNoticiaNova = false;
		$rootScope.notifyTrayNumber = false;
		if ($rootScope.notifyTray) {
			for (var k = 0; k < $rootScope.notifyTray.length; k++) {
				$rootScope.notifyTray[k].isViewed = 1;
			}
		}
	};

	$rootScope.clicarNotificacao = function(notify) {
		$rootScope.abrirNotificacoes();
		if ($ionicSideMenuDelegate.isOpenRight()) {
			$ionicSideMenuDelegate.toggleRight(false);
		}
		if (!notify) return;

		// 1. Se for Lembrete de Oração -> abre diretamente na oração específica
		if (notify.tipo === 'oracao' || notify.oracaoId) {
			$state.go('app.posts', {
				catId: 'oracoes',
				post: notify.oracaoId,
				pageTitle: 'Canais de Oração'
			});
			return;
		}

		// 2. Se for Anúncio / Notícia do Feed -> abre direto no Feed e foca no anúncio
		var targetFeedId = notify.feedId || notify.id;
		$state.go('app.feed').then(function() {
			$timeout(function() {
				$rootScope.$broadcast('destacarAnuncioFeed', { feedId: targetFeedId, notif: notify });
			}, 350);
		});
	};

	updateNotifysTray();

	var shownotifyTop = function(args, isActive) {

		console.log('showNotigy', args, isActive);

		$ionicScrollDelegate.scrollTop();		
			
		if($ionicSideMenuDelegate.isOpenRight()){
			$ionicSideMenuDelegate.toggleRight();
		}

		if(!args.imgThumb) {
			args.imgThumb = G.santos[Math.floor(Math.random() * G.santos.length)]['img'];
		}

		$rootScope.jsTopContentShow = true;
		args['scheduleShow'] = false;
		$rootScope.jsTopnotify = args;
					
		$rootScope.jsTopnotify.buttons = (typeof(args.buttons) != 'undefined') ? args.buttons : false;

		if(
			(args.autoRun && args.autoRun == true && args.action) ||
			(isActive == true && args.action)
		) {
			
			if(args.action[0] == 'state') {
				$rootScope.goState(args.action[1], args.action[2]);
			}
		}

	};

	$rootScope.jsShownotifyTop = shownotifyTop;

	var start = function() {

		console.log('OneSignalAlreadyStarted', jsUser.getUser().id, jsUser.getUser().token);

		if(OneSignalAlreadyStarted === false && window.plugins && window.plugins.OneSignal && jsUser && jsUser.getUser().id && jsUser.getUser().token) {		

			window.plugins.OneSignal.setSubscription(true);

			var notifyOpenedCallback = function(r) {

				//TMP
				console.log('didReceiveRemotenotifyCallBack:', r, JSON.stringify(r).length);				

				$rootScope.$apply(function(){
					shownotifyTop(r.additionalData, !r.isActive);
				});

			};

			window.plugins.OneSignal.init('4a186b3c-8f03-4a32-a653-c1a694b76b91', {googleProjectNumber: '413355245882', autoRegister: true}, notifyOpenedCallback);
			
			window.plugins.OneSignal.enableVibrate(true);
			window.plugins.OneSignal.enableSound(true);

			// Show an alert box if a notification comes in when the user is in your app.
			window.plugins.OneSignal.enableInAppAlertNotification(false);

			window.plugins.OneSignal.enableNotificationsWhenActive(false);
				
			if(jsUser && jsUser.getUser().id) {
				window.plugins.OneSignal.sendTag('jsId', jsUser.getUser().id);
			}

			window.plugins.OneSignal.getIds(function(ids) {
				console.log('window.plugins.OneSignal.getIds', ids);
				webService.call({op: 'updateUser', generalData: {pushOneId: ids.userId}}).then(function(r){ console.log('updateUserpushOneId', r.data);
					OneSignalAlreadyStarted = true;
				});
				
			});
		} else {
			console.log('jsNotify ALREADY STARTED', OneSignalAlreadyStarted);
		}
	};

	var registerIds = function(){
		if(window.plugins && window.plugins.OneSignal && jsUser && jsUser.getUser().id && jsUser.getUser().token) {
			
			window.plugins.OneSignal.sendTag('jsId', jsUser.getUser().id);

			console.log('registerIds-start');

			window.plugins.OneSignal.getIds(function(ids) {

				webService.call({op: 'updateUser', generalData: {pushOneId: ids.userId}}).then(function(r){
					//
					console.log('registerIds-pushOneId', ids.userId);
				});
				
			});
		}
	}

	return {
		start: start,
		button: button,
		registerIds: registerIds
	};
});
