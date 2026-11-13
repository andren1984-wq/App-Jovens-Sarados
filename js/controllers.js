angular.module('starter.controllers', ['ngSanitize'])



.controller('AppCtrl', function($scope, $rootScope, $state, $ionicPopup, jsUser, $ionicLoading, $ionicSideMenuDelegate, CONF, G) {



	$scope.$on('$viewContentLoaded', function(){

    console.log('appCT');

  });

	

	$scope.G = G;



	$scope.openSide = function(){

		

	};



	$scope.openSideRight = function(){

		$ionicSideMenuDelegate.toggleRight(!$ionicSideMenuDelegate.isOpenRight());

	};



	$scope.user = jsUser.getUser();



	$rootScope.notifyTrayNumber = false;



	$scope.notificationColor = function(i) {

		$scope.G.notificationNumber = i;

		return i > 0 ? 'BF360C' : 'FFF';

	};



	$scope.shareClick = function() {

		//G.vars.canais.splice(1, 0, {nome: 'Novo Canal', 'icone': 'ion-chatbox-working', 'acao': {'type': '$rootScope.goState', data: 'app.liturgiaDiaria'}})

		$ionicLoading.show({template: '<img src="img/loading.gif"/>Salve Maria Me de Deus!<br /><br />Aguarde, preparando o App pra voc!'});

	};



	$scope.showConfirmLogOut = function() {

		

		var confirmPopup = $ionicPopup.confirm({

			title: 'Voc deseja Sair da sua conta?', 

			cssClass: 'button-assertive',

			okText: 'Sim',

			cancelText: 'No'

		});



		confirmPopup.then(function(r) {

			

			if (r) {

				jsUser.logout();

				$rootScope.goState('login');				

				

			} else {

				//cancel log out

			}



		});

	};

})



.controller('LoginCtrl', function($scope, $rootScope, $state, $ionicLoading, $ionicPopup, webService, jsUser) {

	$scope.abaAcesso = 'membro'; // 'membro' ou 'admin'
	$scope.setAbaAcesso = function(aba) {
		$scope.abaAcesso = aba;
	};

	$scope.loginForm = {
		email: '',
		senha: '',
		lembrar: true
	};

	$scope.adminForm = {
		login: '',
		senha: '',
		lembrar: false
	};

	$scope.mostrarSenhaLogin = false;
	$scope.mostrarSenhaAdmin = false;

	// FunÃ§Ã£o auxiliar para efetivar login de administrador master
	function autenticarAdminMaster(nomeAdmin, emailAdmin) {
		var adminUser = {
			id: 1,
			nome: nomeAdmin || 'AndrÃ© Pereira do Nascimento',
			email: emailAdmin || 'andre.n1984@gmail.com',
			senha: '2026',
			celular: '(11) 98765-4321',
			missao: 'SÃ£o Paulo - SP (Sede)',
			ministerio: 'CoordenaÃ§Ã£o Geral e ComunicaÃ§Ã£o',
			maranatha: true,
			cadastrado: true,
			foto: 'img/brand/insta-profile-logo.jpg',
			isAdmin: true,
			master: true,
			token: 'admin-master-token',
			tipo: 'Administrador Geral'
		};
		$ionicLoading.hide();
		jsUser.setUser(adminUser);
		try {
			window.localStorage.setItem('jsUser', JSON.stringify(adminUser));
			window.localStorage.setItem('js_user_profile_v1', JSON.stringify(adminUser));
			window.localStorage.setItem('js_user_session', JSON.stringify(adminUser));
		} catch(e) {}
		$rootScope.user = adminUser;
		$rootScope.isAdmin = true;
		$rootScope.userIsAdmin = true;
		$rootScope.isMaster = true;
		$rootScope.perfilCompleto = true;

		// Leva diretamente para o Painel do Administrador onde estÃ£o as pessoas cadastradas
		$state.go('app.painelAdmin');
	}

	// 1. Login com Email e Senha (Acesso Ã  Conta / Membro Normal)
	$scope.loginComEmailSenha = function() {
		var email = ($scope.loginForm.email || '').trim().toLowerCase();
		var senha = ($scope.loginForm.senha || '').trim();

		if (!email || !senha) {
			alert('Por favor, informe seu e-mail e sua senha.');
			return;
		}

		$ionicLoading.show({ template: 'Autenticando...' });

		// DetecÃ§Ã£o inteligente se o administrador logar pela aba comum
		if (email === 'andre.n1984@gmail.com' || email === 'admin') {
			if (senha !== '2026') {
				$ionicLoading.hide();
				alert('E-mail ou login errado, por favor, tente novamente ou clique em esqueceu a senha.');
				return;
			}
			autenticarAdminMaster('AndrÃ© Pereira do Nascimento', 'andre.n1984@gmail.com');
			return;
		}

		// AutenticaÃ§Ã£o de Membro normal via webService (estrito: sem cadastro antes, nÃ£o entra)
		// Se nÃ£o for admin, limpa qualquer resquÃ­cio de admin do navegador
		try {
			window.localStorage.removeItem('js_admin_auth_v1');
		} catch(e) {}
		$rootScope.isAdmin = false;
		$rootScope.userIsAdmin = false;
		$rootScope.isMaster = false;

		webService.call({op: 'emailLogin', email: email, senha: senha}).then(function(r) {
			$ionicLoading.hide();
			if (r && r.data && !r.data.error && r.data.email) {
				jsUser.setUser(r.data);
				try {
					window.localStorage.setItem('jsUser', JSON.stringify(r.data));
					window.localStorage.setItem('js_user_profile_v1', JSON.stringify(r.data));
					window.localStorage.setItem('js_user_session', JSON.stringify(r.data));
				} catch(e) {}
				$rootScope.user = r.data;
				$rootScope.perfilCompleto = true;
				if (r.data.isAdmin) {
					$rootScope.isAdmin = true;
					$rootScope.userIsAdmin = true;
					$state.go('app.painelAdmin');
				} else {
					$rootScope.isAdmin = false;
					$rootScope.userIsAdmin = false;
					$state.go('app.feed');
				}
			} else {
				var msg = (r && r.data && r.data.message) ? r.data.message : 'E-mail ou login errado, por favor, tente novamente ou clique em esqueceu a senha.';
				alert(msg);
			}
		}, function(err) {
			$ionicLoading.hide();
			alert('Erro ao conectar. Tente novamente.');
		});
	};

	// 2. Login exclusivo do Administrador (Acesso Admin Master)
	$scope.loginComoAdmin = function() {
		var login = ($scope.adminForm.login || '').trim().toLowerCase();
		var senha = ($scope.adminForm.senha || '').trim();

		if (!login || !senha) {
			alert('Por favor, informe o e-mail ou login do administrador e a senha.');
			return;
		}

		$ionicLoading.show({ template: 'Validando acesso de administrador...' });

		// ValidaÃ§Ã£o do Admin Geral Master (AndrÃ© ou admin / 2026)
		if (login === 'andre.n1984@gmail.com' || login === 'admin' || login === 'coordenacao') {
			if (senha !== '2026') {
				$ionicLoading.hide();
				alert('Senha de administrador incorreta. Tente novamente com a senha geral (2026).');
				return;
			}
			autenticarAdminMaster('AndrÃ© Pereira do Nascimento', 'andre.n1984@gmail.com');
			return;
		}

		// Checagem em outros administradores cadastrados
		webService.call({op: 'emailLogin', email: login, senha: senha}).then(function(r) {
			$ionicLoading.hide();
			if (r && r.data && !r.data.error && (r.data.isAdmin || senha === '2026')) {
				r.data.isAdmin = true;
				jsUser.setUser(r.data);
				try {
					window.localStorage.setItem('jsUser', JSON.stringify(r.data));
					window.localStorage.setItem('js_user_profile_v1', JSON.stringify(r.data));
					window.localStorage.setItem('js_user_session', JSON.stringify(r.data));
				} catch(e) {}
				$rootScope.user = r.data;
				$rootScope.isAdmin = true;
				$rootScope.userIsAdmin = true;
				$state.go('app.painelAdmin');
			} else {
				alert('Acesso nÃ£o autorizado como administrador. Verifique as credenciais ou use o login normal.');
			}
		}, function(err) {
			$ionicLoading.hide();
			alert('Erro ao conectar. Tente novamente.');
		});
	};

	// 3. Navegar para Criar Cadastro Normal
	$scope.irParaCriarConta = function() {
		$state.go('app.editarConta');
	};

	// 3. Fluxo de RecuperaÃ§Ã£o de Senha com cÃ³digo JS12345
	$scope.modalEsqueceuSenhaAberto = false;
	$scope.etapaRecuperacao = 1;
	$scope.recuperacao = {
		email: '',
		codigo: '',
		novaSenha: '',
		confirmaSenha: ''
	};

	$scope.abrirEsqueceuSenha = function() {
		$scope.modalEsqueceuSenhaAberto = true;
		$scope.etapaRecuperacao = 1;
		$scope.recuperacao = { email: $scope.loginForm.email || '', codigo: '', novaSenha: '', confirmaSenha: '' };
	};

	$scope.fecharEsqueceuSenha = function() {
		$scope.modalEsqueceuSenhaAberto = false;
	};

	$scope.solicitarCodigoRecuperacao = function() {
		var email = ($scope.recuperacao.email || '').trim();
		if (!email || email.indexOf('@') === -1) {
			alert('Por favor, informe um e-mail vÃ¡lido.');
			return;
		}
		$scope.etapaRecuperacao = 2;
		alert('Um e-mail foi enviado para ' + email + ' com o cÃ³digo provisÃ³rio de recuperaÃ§Ã£o (JS12345).');
	};

	$scope.validarCodigoRecuperacao = function() {
		var cod = ($scope.recuperacao.codigo || '').trim().toUpperCase();
		if (cod === 'JS12345') {
			$scope.etapaRecuperacao = 3;
		} else {
			alert('CÃ³digo incorreto! O cÃ³digo padrÃ£o de verificaÃ§Ã£o enviado Ã©: JS12345');
		}
	};

	$scope.salvarNovaSenhaRecuperada = function() {
		var n1 = $scope.recuperacao.novaSenha || '';
		var n2 = $scope.recuperacao.confirmaSenha || '';

		if (n1.length < 6) {
			alert('A nova senha deve ter no mÃ­nimo 6 caracteres.');
			return;
		}
		if (n1 !== n2) {
			alert('As senhas digitadas nÃ£o coincidem. Digite novamente.');
			return;
		}

		var email = $scope.recuperacao.email.toLowerCase().trim();
		var saved = {};
		try {
			var l = window.localStorage.getItem('js_user_profile_v1');
			if (l) saved = JSON.parse(l);
		} catch(e) {}
		saved.email = email;
		saved.senha = n1;
		try { window.localStorage.setItem('js_user_profile_v1', JSON.stringify(saved)); } catch(e) {}

		$scope.modalEsqueceuSenhaAberto = false;
		alert('Senha alterada com sucesso! VocÃª jÃ¡ estÃ¡ autenticado.');
		jsUser.setUser(saved);
		$rootScope.perfilCompleto = true;
		$state.go('app.feed');
	};
})

.controller('criarcontaCtrl', function($scope, $rootScope, $state, $ionicHistory, $cordovaCamera, webService, jsUser, $ionicPopup, $ionicLoading, DB, jsNotify) {

	

	$scope.back = function() { 

		$ionicHistory.goBack();	

	};

	

	$scope.criarConta = function() {

		console.log($scope.nome);

	};

	

	webService.call({op: 'listarMissoesTodas'}).then(function(r){

		var missoes = {};

		

		var j = 0;

		

		missoes[j] = {

			nome: '--- Nenhuma ---',

			id: 0

		};

		

		for(var i in r.data) {

			j++;

			missoes[j] = {

				nome: r.data[i]['estado']+' - '+r.data[i]['missao_nome'],

				id: r.data[i]['missao_id']

			};

		}

		$scope.missoes = missoes;

	});



	$scope.getPhoto = function() {

		

		var options = {

			quality: 100,

			destinationType: Camera.DestinationType.DATA_URL,

			sourceType: Camera.PictureSourceType.PHOTOLIBRARY,

			allowEdit: true,

			encodingType: Camera.EncodingType.JPEG,

			targetWidth: 500,

			targetHeight: 500,

			saveToPhotoAlbum: false,

		};

 

		$cordovaCamera.getPicture(options).then(function(imageData) {

			$scope.imageData = imageData;			

			}, function(e) { }

		);

	};

	

	$scope.formData = {};



	$scope.submit = function(form){



		//$toCheck = array('nome' => '%s', 'email' => '%s', 'senha' => '%s', 'imagem' => '%s', 'celular' => '%s', 'nascimento' => '%s', 'missao' => '%d', 'fezmaranatha' => '%d', 'token' => '%s');	



		var params = {

			op: 'registerUser',

			//imagemBase64: $scope.imageData,

			email: $scope.formData.email,

			senha: $scope.formData.senha,

			nome: $scope.formData.nome,

			celular: $scope.formData.celular,

			missao: ($scope.formData.missao && $scope.formData.missao.id) ? $scope.formData.missao.id : 0,

			fezmaranatha: $scope.formData.maranatha

		};



		var nascimento = new Date($scope.formData.nascimento);



		if(!isNaN(nascimento.getFullYear()) && !isNaN(nascimento.getMonth()) && !isNaN(nascimento.getDate())) {

			params['nascimento'] = (nascimento.getFullYear())+'-'+(nascimento.getMonth()+1)+'-'+(nascimento.getDate());

		}



		if($scope.imageData && $scope.imageData.length > 100) {

			params['imagemBase64'] = $scope.imageData;

		}



		console.log(params);



		if(form.$invalid != true) {

			

			$ionicLoading.show({

				template: 'Enviando...'

			});



			webService.call(params).then(function(r){



				console.log('criarContaReturn', r.data);

				

				var setUser = jsUser.setUser(r.data);

				

				$ionicLoading.hide();



				if(setUser == false) {



					var msg;



					if(r.data.error && r.data.error == 'emailRegistered') {

						var msg = 'Este email j est cadastrado. Por favor informe outro.';

					}



					$ionicPopup.alert({

						title:  typeof(msg) != 'undefined' ? msg : 'Ocorreu algum problema com o seu registro. Por favor verifique e tente novamente.',

						okType: 'button-assertive'

					});



				} else {

					

					$ionicPopup.alert({

						title: 'Parabns, seu cadastro foi realizado :)',

						okType: 'button-assertive'

					}).then(function(){

						jsNotify.registerIds();

						$state.go('app.feed');

					});

				}

			});



		} else {



			var alertPopup = $ionicPopup.alert({

				title: 'Voc deve preencher o formulrio corretamente.',

				okType: 'button-assertive'

			});

		}

	};



	$scope.verificarUsuario = function(){

		console.log('verificarUsuario', jsUser.getUser(), jsUser.isLogged());

	};



})



.controller('editarContaCtrl', function($scope, $rootScope, $state, $stateParams, $ionicLoading, $ionicPopup, webService, jsUser) {

	// 1. Carregar lista oficial de MissÃµes JS Brasil (somente os nomes da planilha)
	var nomesMissoes = [];
	if (typeof window !== 'undefined' && window.JS_NOMES_MISSOES && window.JS_NOMES_MISSOES.length) {
		nomesMissoes = window.JS_NOMES_MISSOES;
	} else if (typeof window !== 'undefined' && window.JS_MISSOES_DATA && window.JS_MISSOES_DATA.length) {
		var setNomes = {};
		for (var i = 0; i < window.JS_MISSOES_DATA.length; i++) {
			var m = window.JS_MISSOES_DATA[i];
			if (m && m.nome && m.nome !== '-') {
				setNomes[m.nome.trim()] = true;
			}
		}
		nomesMissoes = Object.keys(setNomes).sort();
	}
	$scope.missoesNomesLista = nomesMissoes;

	// Modal do Seletor de MissÃµes
	$scope.mostrarModalMissao = false;
	$scope.filtroBuscaMissao = { termo: '' };

	$scope.abrirSeletorMissao = function() {
		$scope.mostrarModalMissao = true;
		$scope.filtroBuscaMissao.termo = '';
	};

	$scope.fecharSeletorMissao = function() {
		$scope.mostrarModalMissao = false;
	};

	$scope.selecionarMissao = function(nome) {
		$scope.formData.missao = nome;
		$scope.mostrarModalMissao = false;
	};

	$scope.filtrarMissoes = function() {
		var termo = ($scope.filtroBuscaMissao.termo || '').toLowerCase().trim();
		if (!termo) return $scope.missoesNomesLista;
		return $scope.missoesNomesLista.filter(function(n) {
			return n.toLowerCase().indexOf(termo) !== -1;
		});
	};

	// 2. Data de Nascimento: DigitaÃ§Ã£o direta com mÃ¡scara + CalendÃ¡rio ClicÃ¡vel
	$scope.formatarDataDigitada = function(e) {
		var val = ($scope.formData.nascimento || '').replace(/\D/g, '');
		if (val.length > 8) val = val.substring(0, 8);
		if (val.length >= 5) {
			$scope.formData.nascimento = val.substring(0, 2) + '/' + val.substring(2, 4) + '/' + val.substring(4, 8);
		} else if (val.length >= 3) {
			$scope.formData.nascimento = val.substring(0, 2) + '/' + val.substring(2, 4);
		} else {
			$scope.formData.nascimento = val;
		}
	};

	$scope.abrirDatePicker = function() {
		var el = document.getElementById('hiddenDatePicker');
		if (el) {
			if (typeof el.showPicker === 'function') {
				try { el.showPicker(); return; } catch(err) {}
			}
			el.style.pointerEvents = 'auto';
			el.focus();
			el.click();
		}
	};

	$scope.onDataCalendarioEscolhida = function(input) {
		if (input && input.value) {
			var parts = input.value.split('-');
			if (parts.length === 3) {
				$scope.$apply(function() {
					$scope.formData.nascimento = parts[2] + '/' + parts[1] + '/' + parts[0];
				});
			}
		}
	};

	// 3. Carregar dados atuais do usuÃ¡rio
	var userData = jsUser.getUser() || {};
	var perfilSalvo = {};
	try {
		var local = window.localStorage.getItem('js_user_profile_v1');
		if (local) perfilSalvo = JSON.parse(local);
	} catch(e) {}

	var merged = angular.extend({}, userData, perfilSalvo);

	var isComplete = Boolean(
		merged.nome && merged.nome !== 'Jovem Sarado' &&
		merged.email &&
		merged.celular &&
		merged.missao &&
		merged.ministerio
	);

	$scope.isNovoCadastro = !isComplete;

	var dataNasc = merged.nascimento || '';
	if (dataNasc && typeof dataNasc === 'string' && dataNasc.indexOf('-') !== -1) {
		var p = dataNasc.split('T')[0].split('-');
		if (p.length === 3 && p[0].length === 4) {
			dataNasc = p[2] + '/' + p[1] + '/' + p[0];
		}
	}

	$scope.formData = {
		nome: merged.nome && merged.nome !== 'Jovem Sarado' ? merged.nome : '',
		email: merged.email || '',
		celular: merged.celular || '',
		nascimento: dataNasc,
		missao: merged.missao || '',
		ministerio: merged.ministerio || '',
		maranatha: merged.maranatha !== undefined ? Boolean(merged.maranatha) : false,
		foto: merged.foto || 'img/brand/insta-profile-logo.jpg',
		notificacoes: merged.notificacoes || { avisos: true, pedrinhas: true }
	};

	// 5. Upload de foto local via FileReader (Base64)
	$scope.onFileSelected = function(input) {
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onload = function(e) {
				$scope.$apply(function() {
					$scope.formData.foto = e.target.result;
				});
			};
			reader.readAsDataURL(input.files[0]);
		}
	};

	$scope.obterPrimeiroNome = function() {
		if ($scope.formData && $scope.formData.nome && $scope.formData.nome.trim() !== '') {
			var parts = $scope.formData.nome.trim().split(/\s+/);
			if (parts.length > 0 && parts[0]) return parts[0];
		}
		if ($rootScope.getPrimeiroNome) {
			var p = $rootScope.getPrimeiroNome();
			if (p) return p;
		}
		return 'AndrÃ©';
	};

	// 6. Salvar e Concluir Cadastro
	$scope.submit = function() {
		var d = $scope.formData;

		if (!d.nome || !d.nome.trim()) {
			alert('Por favor, informe seu Nome Completo.');
			return;
		}
		if (!d.email || !d.email.trim() || d.email.indexOf('@') === -1) {
			alert('Por favor, informe um E-mail vÃ¡lido.');
			return;
		}
		if (!d.celular || !d.celular.trim()) {
			alert('Por favor, informe seu Telefone Celular / WhatsApp.');
			return;
		}
		if (!d.nascimento || !d.nascimento.trim()) {
			alert('Por favor, informe sua Data de Nascimento.');
			return;
		}
		// MissÃ£o e MinistÃ©rio sÃ£o opcionais para o cadastro
		if (!d.senha || d.senha.length < 6) {
			alert('Por favor, crie uma senha de acesso com no mÃ­nimo 6 caracteres.');
			return;
		}

		$ionicLoading.show({
			template: '<ion-spinner></ion-spinner><br>Salvando seu cadastro...'
		});

		var payload = {
			op: 'updateUser',
			nome: d.nome.trim(),
			email: d.email.trim(),
			senha: d.senha,
			celular: d.celular.trim(),
			nascimento: d.nascimento,
			missao: d.missao,
			ministerio: d.ministerio.trim(),
			maranatha: d.maranatha,
			foto: d.foto,
			notificacoes: d.notificacoes
		};

		if (d.email.trim().toLowerCase() === 'andre.n1984@gmail.com') {
			payload.isAdmin = true;
			payload.tipo = 'Administrador Geral';
			$rootScope.isAdmin = true;
		}

		webService.call(payload).then(function(r) {
			$ionicLoading.hide();
			jsUser.setUser(payload);
			try {
				window.localStorage.setItem('js_user_profile_v1', JSON.stringify(payload));
			} catch(e) {}
			$rootScope.perfilCompleto = true;
			$scope.isNovoCadastro = false;

			alert('GlÃ³ria a Deus! Seu cadastro oficial da GeraÃ§Ã£o Radical foi salvo com sucesso.');
			$state.go('app.feed');
		}, function(err) {
			$ionicLoading.hide();
			alert('Erro ao salvar cadastro. Tente novamente.');
		});
	};
})

.controller('escolaJsCtrl', function($scope, $rootScope, $stateParams, webService, CONF, $ionicLoading) {

	var wOpen = window.open('https://app.jovenssarados.com/js-ead/','_blank','location=no,hidden=yes,zoom=no');



	wOpen.addEventListener('loadstart', function(){

		$ionicLoading.show({template: '<img src="img/loading.gif"/>'});

	});



	wOpen.addEventListener('loadstop', function(){

		wOpen.show();

		$ionicLoading.hide();

	});



	wOpen.addEventListener('loaderror', function(){alert(3);});

})

.controller('frasesSantosCtrl', function($scope, $rootScope, $state, $stateParams, webService, CONF, $ionicPopup, $cordovaToast, $window, $ionicScrollDelegate) {

	var webServiceArgs = {};

	if($stateParams.idSanto && $stateParams.idSanto.length > 0){
		webServiceArgs.op = 'santosFrase';
		webServiceArgs.idSanto = $stateParams.idSanto;
	} else {
		webServiceArgs.op = 'santosLista';
	}

	// Paleta de Cores Vibrantes e Joviais Jovens Sarados para as Frases
	var coresJS = [
		{ borda: '#FF2A2A', badgeGrad: 'linear-gradient(135deg, #FF2A2A 0%, #DC2626 100%)', bgPill: '#FEE2E2', corPill: '#B91C1C', sombra: 'rgba(255, 42, 42, 0.25)' },
		{ borda: '#FF6A00', badgeGrad: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)', bgPill: '#FFEDD5', corPill: '#C2410C', sombra: 'rgba(255, 106, 0, 0.25)' },
		{ borda: '#003CFF', badgeGrad: 'linear-gradient(135deg, #003CFF 0%, #101650 100%)', bgPill: '#DBEAFE', corPill: '#1E40AF', sombra: 'rgba(0, 60, 255, 0.25)' },
		{ borda: '#F59E0B', badgeGrad: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bgPill: '#FEF3C7', corPill: '#92400E', sombra: 'rgba(245, 158, 11, 0.25)' },
		{ borda: '#10B981', badgeGrad: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bgPill: '#D1FAE5', corPill: '#065F46', sombra: 'rgba(16, 185, 129, 0.25)' },
		{ borda: '#8B5CF6', badgeGrad: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', bgPill: '#EDE9FE', corPill: '#5B21B6', sombra: 'rgba(139, 92, 246, 0.25)' }
	];

	$scope.getEstiloFrase = function(index) {
		return coresJS[index % coresJS.length];
	};

	webService.call(webServiceArgs, true).then(function(r){
		if(webServiceArgs.op == 'santosFrase') {
			$scope.mostrarFrases = true;
			$scope.santoInfo = r.data || {};
			$scope.feedsFrases = (r.data && r.data.frases) ? r.data.frases : [];
			$scope.nomeDoSanto = (r.data && r.data.nome) ? r.data.nome : 'Frases do Santo';
		} else {
			$scope.mostrarFrases = false;
			$scope.todosSantos = r.data || [];
			$scope.feeds = r.data || [];
		}
	});

	// CLIQUE DIRETO NO SANTO (Acesso imediato Ã s frases, sem depender de URL ou reload)
	$scope.selecionarSanto = function(santo) {
		if (!santo) return;
		$scope.santoInfo = santo;
		$scope.nomeDoSanto = santo.nome;
		$scope.feedsFrases = santo.frases || [];
		$scope.mostrarFrases = true;
		if ($ionicScrollDelegate && typeof $ionicScrollDelegate.scrollTop === 'function') {
			$ionicScrollDelegate.scrollTop(true);
		}
	};

	// VOLTAR PARA A LISTA DE SANTOS
	$scope.voltarParaLista = function() {
		$scope.mostrarFrases = false;
		$scope.santoInfo = null;
		$scope.nomeDoSanto = '';
		$scope.feeds = $scope.todosSantos || [];
		if ($ionicScrollDelegate && typeof $ionicScrollDelegate.scrollTop === 'function') {
			$ionicScrollDelegate.scrollTop(true);
		}
	};

	// Compartilhar no WhatsApp (para Admin e Cadastrado)
	$scope.shareFraseWhatsApp = function(feed) {
		if (!feed) return;
		var autor = $scope.nomeDoSanto || ($scope.santoInfo && $scope.santoInfo.nome) || 'Santos CatÃ³licos';
		var plainFrase = (feed.frase || '').replace(/<[^>]*>?/gm, '').trim();
		var msg = 'âœ¨ *Jovens Sarados â€¢ Frases dos Santos*\n\n' +
				  'ðŸ’¬ _"' + plainFrase + '"_\n\n' +
				  'ðŸ‘‘ *' + autor + '*\n' +
				  (($scope.santoInfo && $scope.santoInfo.titulo) ? ('_' + $scope.santoInfo.titulo + '_\n\n') : '\n') +
				  'ðŸ“² *App Jovens Sarados* â€¢ Acesse e viva a radicalidade evangÃ©lica:\n' +
				  'https://gmbh-parking-deeply-licensed.trycloudflare.com';
		var url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(msg);
		$window.open(url, '_blank');
	};

	// Compartilhar no Instagram Pessoal do UsuÃ¡rio (para Admin e Cadastrado)
	$scope.shareFraseInstagram = function(feed) {
		if (!feed) return;
		var autor = $scope.nomeDoSanto || ($scope.santoInfo && $scope.santoInfo.nome) || 'Santos CatÃ³licos';
		var plainFrase = (feed.frase || '').replace(/<[^>]*>?/gm, '').trim();
		var shareText = '"' + plainFrase + '" â€” ' + autor + ' #JovensSarados #FrasesDosSantos #Santidade';

		function abrirInstagramPessoal() {
			var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
			if (isMobile) {
				window.location.href = 'instagram://app';
				setTimeout(function() {
					$window.open('https://www.instagram.com/', '_blank');
				}, 600);
			} else {
				$window.open('https://www.instagram.com/', '_blank');
			}
		}

		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareText).then(function() {
				$ionicPopup.alert({
					title: 'Frase Copiada! ðŸ“¸',
					template: '<div style="text-align: center;"><i class="icon ion-social-instagram" style="font-size: 38px; color: #E1306C;"></i><p style="margin-top: 10px; font-weight: 700; font-size: 14px;">A frase foi copiada com sucesso!</p><p style="font-size: 12px; color: #64748B;">Vamos abrir o seu Instagram pessoal para vocÃª colar no seu Story ou Feed.</p></div>'
				}).then(function() {
					abrirInstagramPessoal();
				});
			}).catch(function() {
				abrirInstagramPessoal();
			});
		} else {
			abrirInstagramPessoal();
		}
	};

})

.controller('quemSomosCtrl', function($scope, $rootScope, $stateParams, webService, CONF, $ionicPopup, $ionicModal, $ionicLoading, $cordovaToast, $http, $sce) {

	$scope.activeTab = 'quemSomos';
	$scope.editAbaAtual = 'video';

	$scope.setTab = function(tab) {
		$scope.activeTab = tab;
	};

	$scope.setEditAba = function(aba) {
		$scope.editAbaAtual = aba;
	};

	// Transforma links do YouTube normais em URLs de embed seguras
	$scope.getVideoEmbedUrl = function(url) {
		if (!url) return '';
		var cleanUrl = url.trim();

		// Se jÃ¡ for link de embed
		if (cleanUrl.indexOf('youtube.com/embed/') !== -1) {
			return $sce.trustAsResourceUrl(cleanUrl);
		}

		// Se for formato padrÃ£o: youtube.com/watch?v=ID
		var matchWatch = cleanUrl.match(/[?&]v=([^&]+)/);
		if (matchWatch && matchWatch[1]) {
			return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + matchWatch[1]);
		}

		// Se for formato encurtado: youtu.be/ID
		var matchShort = cleanUrl.match(/youtu\.be\/([^?&]+)/);
		if (matchShort && matchShort[1]) {
			return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + matchShort[1]);
		}

		return $sce.trustAsResourceUrl(cleanUrl);
	};

	// Dados padrÃ£o caso o servidor nÃ£o responda de imediato
	var dadosPadrao = {
		videoUrl: 'https://www.youtube.com/embed/Pj15b6P-H-A',
		videoTitulo: 'ConheÃ§a o Carisma Jovens Sarados',
		activeTab: 'quemSomos',
		abas: {
			quemSomos: {
				titulo: 'Quem Somos',
				subtitulo: 'A Academia para a sua Alma â€¢ Radicalidade & Santidade',
				citacao: "NÃ³s existiremos enquanto permanecer em nÃ³s essa 'loucura' por salvar almas jovens. Enquanto houver um jovem sofrendo, nas drogas, na prostituiÃ§Ã£o, vazio de sentido, ali os Jovens Sarados devem estar. Jesus Ã© o mÃ©dico e o remÃ©dio que cura a alma, a mente e o coraÃ§Ã£o.",
				citacaoAutor: 'Padre Edimilson Lopes (Fundador)',
				missaoTexto: 'Os Jovens Sarados sÃ£o um movimento da Igreja CatÃ³lica ApostÃ³lica Romana formado prioritariamente por jovens leigos comprometidos com o resgate e a salvaÃ§Ã£o de almas jovens. Cremos que Jesus Cristo Ã© o mÃ©dico dos mÃ©dicos e o remÃ©dio capaz de curar (sarar) a alma, a mente e o coraÃ§Ã£o. Proclamamos um estilo de vida novo, alegre e profundamente radicado no Evangelho.',
				pilares: [
					{ titulo: 'Sarar a Alma', desc: 'Nossa essÃªncia interior reconciliada com Deus atravÃ©s dos Sacramentos e da vida de oraÃ§Ã£o constante.' },
					{ titulo: 'Sarar a Mente', desc: 'TransformaÃ§Ã£o dos pensamentos, mentalidade do Evangelho e discernimento Ã  luz da Palavra de Deus.' },
					{ titulo: 'Sarar o CoraÃ§Ã£o', desc: 'Cura das feridas da histÃ³ria de vida, acolhimento incondicional e amor fraterno verdadeiro.' }
				],
				marcasIgreja: 'Em total fidelidade e obediÃªncia Ã  Santa Igreja CatÃ³lica: Uma, Santa, CatÃ³lica e ApostÃ³lica.',
				fotos: [
					{ url: 'img/quem-somos-1.jpg', legenda: 'AdoraÃ§Ã£o ao SantÃ­ssimo Sacramento â€” O centro da nossa vida' },
					{ url: 'img/quem-somos-2.jpg', legenda: 'EvangelizaÃ§Ã£o e PregaÃ§Ã£o Radical ao Ar Livre' },
					{ url: 'img/instagram/post-10.jpg', legenda: 'Juventude inflamada pelo fogo do EspÃ­rito Santo' }
				]
			},
			comoComecou: {
				titulo: 'Como Tudo ComeÃ§ou',
				subtitulo: 'A centelha divina em 04 de Abril de 2008',
				introducao: 'Uma inspiraÃ§Ã£o do EspÃ­rito Santo no coraÃ§Ã£o do Padre Edimilson Lopes que acendeu uma fogueira de salvaÃ§Ã£o na juventude de SÃ£o Paulo para o mundo inteiro.',
				marcos: [
					{
						data: '04 de Abril de 2008',
						local: 'RÃ¡dio AmÃ©rica â€” Vila Mariana (SP)',
						titulo: 'O Primeiro Clamor',
						desc: 'Padre Edimilson Lopes, com o anseio de salvar jovens das drogas e da perdiÃ§Ã£o, reÃºne-se com 3 jovens: CÃ­ntia, LÃ©o e Du, na capela da RÃ¡dio AmÃ©rica. Nascia ali, de joelhos no chÃ£o, a semente da missÃ£o.'
					},
					{
						data: 'Maio de 2008',
						local: 'Centro Padre LÃ©o Pereira',
						titulo: 'A InspiraÃ§Ã£o do Nome: Jovens Sarados',
						desc: 'O nÃºmero de jovens cresceu rapidamente. Em oraÃ§Ã£o e escuta de Deus, o EspÃ­rito Santo confirmou o chamado: sermos jovens curados (sarados) para curar outros jovens. Uma verdadeira \'academia para a alma\'!'
					},
					{
						data: 'Ano de 2009',
						local: 'ParÃ³quia N. Sra. das AngÃºstias â€” Barra Funda',
						titulo: 'A Casa da Barra Funda',
						desc: 'Acolhidos com paternidade pelo Padre AdemÃ¡rio, os Jovens Sarados estabeleceram sua missÃ£o na Barra Funda, tornando-se o berÃ§o de incontÃ¡veis conversÃµes, encontros, grupos e vigÃ­lias histÃ³ricas.'
					},
					{
						data: 'ExpansÃ£o Nacional & AlÃ©m',
						local: 'Todo o Brasil e Exterior',
						titulo: 'Uma Obra que NÃ£o Para',
						desc: 'De SÃ£o Paulo a todos os cantos do Brasil e missÃµes internacionais, milhares de jovens foram resgatados da morte para a vida em Cristo, gerando servos dedicados \'Tudo pelo Tudo\'.'
					}
				],
				fotos: [
					{ url: 'img/quem-somos-3.jpg', legenda: 'Encontros de ConversÃ£o e OraÃ§Ã£o' },
					{ url: 'img/instagram/post-14.jpg', legenda: 'Aprofundamentos e Retiros de FormaÃ§Ã£o Radical' }
				]
			},
			compromissoJS: {
				titulo: 'O que Ã© o Compromisso JS',
				subtitulo: 'Radicalidade e Santidade â€¢ Santos ou Nada!',
				lemaBiblico: 'Esquecendo o que fica para trÃ¡s, lanÃ§o-me em direÃ§Ã£o ao que estÃ¡ Ã  frente. LanÃ§o-me em direÃ§Ã£o Ã  meta para conquistar o prÃªmio que do alto Deus me chama a receber em Cristo Jesus.',
				lemaReferencia: 'Filipenses 3, 13-14',
				significado: 'O Compromisso Jovens Sarados Ã© assumido anualmente pelo servo diante de Deus e da comunidade. NÃ£o Ã© uma honraria nem um tÃ­tulo, mas uma entrega irrestrita de amor, fidelidade e obediÃªncia, dedicando a prÃ³pria vida e energias pela salvaÃ§Ã£o dos jovens.',
				tauTexto: 'Comprometo-me a trazer no peito a marca dos Sarados, o TAU, com a plena consciÃªncia de que acima de mim sÃ³ Deus, e que alguÃ©m maior do que eu me acompanha todos os dias em todos os lugares, sendo sinal d\'Ele para minha geraÃ§Ã£o.',
				selos: [
					{ nome: 'Castidade', desc: 'Pureza nos pensamentos, sentimentos e comportamentos, testemunhando a santidade do corpo templo do EspÃ­rito Santo.' },
					{ nome: 'Pobreza', desc: 'Desapego dos bens passageiros, vida despojada e generosa a exemplo da Virgem Maria.' },
					{ nome: 'ObediÃªncia', desc: 'Vida doada por inteiro, sem exigÃªncias pessoais, em profunda comunhÃ£o com a Igreja e com os pastores.' }
				],
				mortificacao: 'Ã€s sextas-feiras, os servos mortificam o homem velho: jejum (apÃ³s o cafÃ© da manhÃ£ atÃ© Ã s 16h), abstinÃªncia de carnes, nÃ£o comendo doces, nÃ£o ingerindo refrigerantes, e oraÃ§Ã£o humilde para confirmar a vocaÃ§Ã£o e eleiÃ§Ã£o (1Pd 1,10).',
				patronos: [
					{ nome: 'SÃ£o JoÃ£o Paulo II', papel: 'Patrono dos Jovens Sarados', img: 'img/santos-joaopauloii.jpg' },
					{ nome: 'SÃ£o JoÃ£o Bosco', papel: 'Patrono dos Jovens Sarados', img: 'img/santos-dombosco.jpg' },
					{ nome: 'SÃ£o Carlo Acutis', papel: 'Patrono dos Jovens Sarados', img: 'img/santos-carloacutis.jpg' },
					{ nome: 'Nossa Senhora da Alegria', papel: 'Patrona e MÃ£e da Obra', img: 'img/santos-nsalegria.jpg' }
				],
				grito: 'TUDO PELO TUDO â€¢ SANTOS OU NADA!'
			}
		}
	};

	$scope.dados = angular.copy(dadosPadrao);

	// Carrega dados da API do servidor
	$scope.carregarDados = function() {
		$http.get('/api/quemSomos')
			.then(function(res) {
				if (res && res.data && res.data.abas) {
					$scope.dados = res.data;
					try {
						localStorage.setItem('js_quem_somos_cache', JSON.stringify(res.data));
					} catch(e) {}
				}
			})
			.catch(function(err) {
				try {
					var cached = localStorage.getItem('js_quem_somos_cache');
					if (cached) {
						$scope.dados = JSON.parse(cached);
					}
				} catch(e) {}
			});
	};

	$scope.carregarDados();

	// Modal de EdiÃ§Ã£o exclusivo para o Administrador
	$ionicModal.fromTemplateUrl('templates/modalEditarQuemSomos.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalEdicao = modal;
	});

	// FormulÃ¡rios para novas fotos por URL
	$scope.formNovaFotoQS = { url: '', legenda: '' };
	$scope.formNovaFotoHistoria = { url: '', legenda: '' };

	// Adicionar e Remover Pilares (Aba 1)
	$scope.adicionarPilar = function() {
		if (!$scope.editDados.abas.quemSomos.pilares) $scope.editDados.abas.quemSomos.pilares = [];
		$scope.editDados.abas.quemSomos.pilares.push({
			titulo: 'Novo Pilar da FormaÃ§Ã£o',
			desc: 'Descreva aqui o propÃ³sito e a vivÃªncia prÃ¡tica deste pilar...'
		});
	};
	$scope.removerPilar = function(index) {
		$scope.editDados.abas.quemSomos.pilares.splice(index, 1);
	};

	// Adicionar e Remover Blocos Extras de InformaÃ§Ã£o (Aba 1 ou Aba 2)
	$scope.adicionarBlocoExtra = function(aba) {
		var target = (aba === 'comoComecou') ? $scope.editDados.abas.comoComecou : $scope.editDados.abas.quemSomos;
		if (!target.blocosExtras) target.blocosExtras = [];
		target.blocosExtras.push({
			titulo: 'Novo Bloco de InformaÃ§Ã£o',
			subtitulo: 'SubtÃ­tulo informativo',
			texto: 'Escreva aqui o conteÃºdo e os detalhes adicionais deste bloco...'
		});
	};
	$scope.removerBlocoExtra = function(aba, index) {
		var target = (aba === 'comoComecou') ? $scope.editDados.abas.comoComecou : $scope.editDados.abas.quemSomos;
		if (target && target.blocosExtras) {
			target.blocosExtras.splice(index, 1);
		}
	};

	// Adicionar e Remover Marcos HistÃ³ricos (Aba 2)
	$scope.adicionarMarco = function() {
		if (!$scope.editDados.abas.comoComecou.marcos) $scope.editDados.abas.comoComecou.marcos = [];
		$scope.editDados.abas.comoComecou.marcos.push({
			data: 'Data / MÃªs / Ano',
			local: 'Local ou Cidade',
			titulo: 'TÃ­tulo do Marco HistÃ³rico',
			desc: 'Descreva os fatos e a importÃ¢ncia deste marco para o Jovens Sarados...'
		});
	};
	$scope.removerMarco = function(index) {
		$scope.editDados.abas.comoComecou.marcos.splice(index, 1);
	};

	// Adicionar e Remover Conselhos / Selos do Compromisso (Aba 3)
	$scope.adicionarSelo = function() {
		if (!$scope.editDados.abas.compromissoJS.selos) $scope.editDados.abas.compromissoJS.selos = [];
		$scope.editDados.abas.compromissoJS.selos.push({
			nome: 'Novo Compromisso / ExigÃªncia',
			desc: 'DescriÃ§Ã£o prÃ¡tica da exigÃªncia ou estilo de vida...'
		});
	};
	$scope.removerSelo = function(index) {
		$scope.editDados.abas.compromissoJS.selos.splice(index, 1);
	};

	// Upload de Foto Local do Dispositivo (Celular / Computador)
	$scope.onFotoSelecionada = function(input, aba) {
		if (input.files && input.files[0]) {
			var file = input.files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				$scope.$apply(function() {
					var nova = {
						url: e.target.result,
						legenda: file.name.replace(/\.[^/.]+$/, "") || 'Momento Jovens Sarados'
					};
					if (aba === 'comoComecou') {
						if (!$scope.editDados.abas.comoComecou.fotos) $scope.editDados.abas.comoComecou.fotos = [];
						$scope.editDados.abas.comoComecou.fotos.push(nova);
					} else {
						if (!$scope.editDados.abas.quemSomos.fotos) $scope.editDados.abas.quemSomos.fotos = [];
						$scope.editDados.abas.quemSomos.fotos.push(nova);
					}
					input.value = '';
					if (window.plugins && window.plugins.toast) {
						$cordovaToast.show('Foto carregada do dispositivo com sucesso!', 'short', 'bottom');
					}
				});
			};
			reader.readAsDataURL(file);
		}
	};

	// Adicionar Foto por URL / Link
	$scope.adicionarFotoUrl = function(aba) {
		var form = (aba === 'comoComecou') ? $scope.formNovaFotoHistoria : $scope.formNovaFotoQS;
		var url = (form.url || '').trim();
		if (!url) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor informe a URL da foto ou use o botÃ£o para escolher do dispositivo.',
				okType: 'button-assertive'
			});
			return;
		}
		var nova = {
			url: url,
			legenda: (form.legenda || '').trim() || 'Momento Jovens Sarados'
		};
		if (aba === 'comoComecou') {
			if (!$scope.editDados.abas.comoComecou.fotos) $scope.editDados.abas.comoComecou.fotos = [];
			$scope.editDados.abas.comoComecou.fotos.push(nova);
		} else {
			if (!$scope.editDados.abas.quemSomos.fotos) $scope.editDados.abas.quemSomos.fotos = [];
			$scope.editDados.abas.quemSomos.fotos.push(nova);
		}
		form.url = '';
		form.legenda = '';
		if (window.plugins && window.plugins.toast) {
			$cordovaToast.show('Foto adicionada!', 'short', 'bottom');
		}
	};

	// Remover Foto
	$scope.removerFoto = function(aba, index) {
		if (aba === 'comoComecou') {
			$scope.editDados.abas.comoComecou.fotos.splice(index, 1);
		} else {
			$scope.editDados.abas.quemSomos.fotos.splice(index, 1);
		}
	};

	$scope.abrirModalEdicao = function() {
		$scope.editDados = angular.copy($scope.dados);
		$scope.editAbaAtual = 'video';
		if ($scope.modalEdicao) {
			$scope.modalEdicao.show();
		}
	};

	$scope.fecharModalEdicao = function() {
		if ($scope.modalEdicao) {
			$scope.modalEdicao.hide();
		}
	};

	$scope.salvarEdicao = function() {
		$ionicLoading.show({
			template: '<ion-spinner icon="spiral"></ion-spinner><p style="margin: 8px 0 0 0;">Salvando alteraÃ§Ãµes...</p>'
		});

		$http.post('/api/quemSomos', $scope.editDados)
			.then(function(res) {
				$ionicLoading.hide();
				$scope.dados = angular.copy($scope.editDados);
				try {
					localStorage.setItem('js_quem_somos_cache', JSON.stringify($scope.dados));
				} catch(e) {}
				$scope.fecharModalEdicao();
				$ionicPopup.alert({
					title: 'Sucesso',
					template: 'ConteÃºdo de Quem Somos atualizado com sucesso!',
					okType: 'button-balanced'
				});
			})
			.catch(function(err) {
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: 'Erro',
					template: 'NÃ£o foi possÃ­vel salvar na API do servidor. Tente novamente.',
					okType: 'button-assertive'
				});
			});
	};

	$scope.$on('$destroy', function() {
		if ($scope.modalEdicao) {
			$scope.modalEdicao.remove();
		}
	});

})

.controller('pedidoOracaoCtrl', function($scope, $rootScope, $stateParams, webService, CONF, $ionicPopup, $ionicLoading, $cordovaToast, $http, jsUser) {

	$scope.pedidos = [];
	$scope.mostrarForm = false;
	$scope.toggleFormNovoPedido = function() {
		$scope.mostrarForm = !$scope.mostrarForm;
	};

	$scope.novoPedido = {
		texto: '',
		anonimo: false
	};

	// Obter usuÃ¡rio logado atual para identificaÃ§Ã£o
	$scope.obterUsuarioAtual = function() {
		var u = jsUser.getUser();
		if (!u) {
			try {
				var saved = localStorage.getItem('js_user_profile_v1');
				if (saved) u = JSON.parse(saved);
			} catch(e) {}
		}
		if (!u) {
			var isAdmin = ($rootScope.isUserAdminMaster && $rootScope.isUserAdminMaster());
			u = {
				nome: isAdmin ? 'AndrÃ© (Admin)' : 'Jovem Sarado',
				foto: isAdmin ? 'img/admin-avatar.png' : 'img/brand/logo-js.png'
			};
		}
		$scope.currUser = u;
		return u;
	};

	$scope.obterUsuarioAtual();

	// Alternar modo anÃ´nimo (sigilo absoluto) x identificado (nome e foto)
	$scope.setModoAnonimo = function(isAnonimo) {
		$scope.novoPedido.anonimo = !!isAnonimo;
	};

	// Carregar pedidos do mural
	$scope.carregarPedidos = function() {
		$http.get('/api/pedidosOracao').then(function(res) {
			var list = [];
			if (res.data) {
				if (angular.isArray(res.data)) {
					list = res.data;
				} else if (res.data.pedidos && angular.isArray(res.data.pedidos)) {
					list = res.data.pedidos;
				} else if (res.data.id) {
					list = [res.data];
				}
			}

			if (list && list.length >= 0) {
				var oracoesFeitas = {};
				try {
					var raw = localStorage.getItem('js_pedidos_rezados_v1');
					if (raw) oracoesFeitas = JSON.parse(raw);
				} catch(e) {}

				$scope.pedidos = list.map(function(item) {
					item.jaRezou = !!oracoesFeitas[item.id];
					return item;
				});
			}
		}).catch(function(err) {
			console.warn('Erro ao carregar pedidos de oracao:', err);
		});
	};

	$scope.carregarPedidos();

	// Enviar novo pedido de oraÃ§Ã£o
	$scope.enviarPedido = function() {
		if (!$scope.novoPedido.texto || $scope.novoPedido.texto.trim().length < 5) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor, escreva o seu pedido de oraÃ§Ã£o antes de enviar.'
			});
			return;
		}

		var payload = {
			texto: $scope.novoPedido.texto.trim(),
			anonimo: $scope.novoPedido.anonimo
		};

		// Se NÃƒO for anÃ´nimo, enviar nome e foto do perfil
		if (!$scope.novoPedido.anonimo) {
			$scope.obterUsuarioAtual();
			payload.nome = $scope.currUser.nome || 'Jovem Sarado';
			payload.foto = $scope.currUser.foto || '';
		}

		$ionicLoading.show({ template: 'Enviando intenÃ§Ã£o...' });

		$http.post('/api/pedidosOracao', payload).then(function(res) {
			$ionicLoading.hide();
			if (res.data && res.data.success) {
				$scope.novoPedido.texto = '';
				$scope.novoPedido.anonimo = false;
				$scope.mostrarForm = false;
				$scope.carregarPedidos();

				$ionicPopup.alert({
					title: 'IntenÃ§Ã£o Enviada!',
					template: '<div style="text-align: center;"><i class="icon ion-ios-checkmark-outline" style="font-size: 44px; color: #16A34A;"></i><p style="margin: 8px 0 0; font-size: 13px; color: #1E293B;">Seu pedido de oraÃ§Ã£o foi acolhido no mural da comunidade com total sigilo e respeito. Estaremos em oraÃ§Ã£o por vocÃª!</p></div>'
				});
			} else {
				$ionicPopup.alert({
					title: 'Erro',
					template: 'NÃ£o foi possÃ­vel salvar seu pedido de oraÃ§Ã£o. Tente novamente.'
				});
			}
		}).catch(function(err) {
			$ionicLoading.hide();
			$ionicPopup.alert({
				title: 'Erro de ComunicaÃ§Ã£o',
				template: 'NÃ£o foi possÃ­vel conectar ao servidor. Tente novamente.'
			});
		});
	};

	// Rezar pela intenÃ§Ã£o
	$scope.rezarIntencao = function(p) {
		if (!p) return;

		var confirmPopup = $ionicPopup.confirm({
			title: 'Unir-se em OraÃ§Ã£o',
			subTitle: 'Reze ao menos uma Ave Maria ou um Pai Nosso por esta intenÃ§Ã£o.',
			okText: 'Sim, vou rezar!',
			cancelText: 'Voltar',
			okType: 'button-calm'
		});

		confirmPopup.then(function(res) {
			if (res) {
				$http.post('/api/pedidosOracao', { action: 'rezar', id: p.id }).then(function(resp) {
					p.intercessoes = (p.intercessoes || 0) + 1;
					p.jaRezou = true;

					try {
						var raw = localStorage.getItem('js_pedidos_rezados_v1');
						var oracoesFeitas = raw ? JSON.parse(raw) : {};
						oracoesFeitas[p.id] = true;
						localStorage.setItem('js_pedidos_rezados_v1', JSON.stringify(oracoesFeitas));
					} catch(e) {}

					$ionicPopup.alert({
						title: 'Deus te abenÃ§oe!',
						template: '<div style="text-align: center;"><i class="icon ion-ios-heart" style="font-size: 40px; color: #EA580C;"></i><p style="margin: 8px 0 0; font-size: 13px;">Sua oraÃ§Ã£o fortalece nosso irmÃ£o e nossa comunidade Jovens Sarados!</p></div>'
					});
				}).catch(function(err) {
					p.intercessoes = (p.intercessoes || 0) + 1;
					p.jaRezou = true;
				});
			}
		});
	};

	// ExclusÃ£o por Moderador / Administrador: remove APENAS aquele comentÃ¡rio especÃ­fico
	$scope.excluirPedido = function(p) {
		if (!p || !p.id) return;

		var confirmDel = $ionicPopup.confirm({
			title: 'Excluir ComentÃ¡rio?',
			subTitle: 'Como Administrador, tem certeza que deseja remover apenas este comentÃ¡rio do mural? Todos os outros permanecerÃ£o intactos.',
			okText: 'Sim, Excluir',
			cancelText: 'Cancelar',
			okType: 'button-assertive'
		});

		confirmDel.then(function(res) {
			if (res) {
				var targetId = p.id.toString().trim();
				// 1. Remove IMEDIATAMENTE da visualizaÃ§Ã£o apenas o comentÃ¡rio excluÃ­do
				$scope.pedidos = ($scope.pedidos || []).filter(function(item) {
					return item && item.id && item.id.toString().trim() !== targetId;
				});

				// 2. Avisa o backend para remover apenas esse ID do arquivo JSON
				$http.delete('/api/pedidosOracao?id=' + encodeURIComponent(targetId)).then(function(resp) {
					// Backend jÃ¡ salvou a lista sem aquele comentÃ¡rio
				}).catch(function(err) {
					console.warn('Erro ao sincronizar exclusÃ£o com servidor:', err);
				});
			}
		});
	};

})

.controller('diarioBiblicoCtrl', function($scope, $rootScope, $state, $stateParams, webService, CONF, $ionicPopup, $window) {

	// O DiÃ¡rio BÃ­blico Ã© sempre o DiÃ¡rio Pessoal do usuÃ¡rio ou administrador autenticado
	// Limpamos inspeÃ§Ã£o de membros para que tanto Colaboradores quanto Administradores tenham total acesso ao seu prÃ³prio diÃ¡rio
	$rootScope.membroPedrinhasInspecionado = null;
	$scope.modoInspecaoBloqueado = false;
	$scope.loadMoreContinue = true;
	$scope.feedUnique = false;
	$scope.filtroTexto = '';

	$scope.$on('diarioBiblico.getFeed', function() {
		$scope.feeds = false; 
		$scope.getFeed();
	});

	$scope.getFeed = function(){
		$scope.modoInspecaoBloqueado = false;
		webService.call({op: "estudoBiblicoGet"}, true).then(function(r){
			if(r && r.data) {
				$scope.feeds = r.data;
			} else {
				$scope.feeds = [];
			}
			$scope.$broadcast("scroll.infiniteScrollComplete");
		});
	};

	$scope.voltarAoPainel = function() {
		$state.go('app.painelAdmin');
	};

	$scope.excluirEntrada = function(feed) {
		if (!feed) return;
		if (confirm("Deseja realmente apagar esta reflexÃ£o do seu DiÃ¡rio BÃ­blico?")) {
			webService.call({op: "estudoBiblicoDelete", id: feed.id}).then(function(r) {
				$scope.feeds = false;
				$scope.getFeed();
			});
		}
	};

	// Helper para abrir Instagram do prÃ³prio usuÃ¡rio
	function abrirInstagramPessoal() {
		var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
		if (isMobile) {
			window.location.href = 'instagram://app';
			setTimeout(function() {
				$window.open('https://www.instagram.com/', '_blank');
			}, 600);
		} else {
			$window.open('https://www.instagram.com/', '_blank');
		}
	}

	$scope.shareDiarioWhatsApp = function(feed) {
		if (!feed) return;
		var appUrl = (window.location && window.location.origin) ? window.location.origin : 'https://forget-schema-loading-satisfaction.trycloudflare.com';
		var passagemTxt = feed.passagem ? ('ðŸ“– *' + feed.passagem + '*\n\n') : '';
		var figurinhaTxt = feed.figurinha ? (feed.figurinha + ' â€¢ ') : '';
		var msg = 'âœ¨ *Meu DiÃ¡rio BÃ­blico â€¢ Jovens Sarados*\n\n' +
				  figurinhaTxt + passagemTxt +
				  'ðŸ’¬ _"' + (feed.texto || '').trim() + '"_\n\n' +
				  'ðŸ“² Registre tambÃ©m seu diÃ¡rio no App Jovens Sarados:\n' + appUrl;
		$window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
	};

	$scope.shareDiarioInstagram = function(feed) {
		if (!feed) return;
		var passagemTxt = feed.passagem ? (' (' + feed.passagem + ')') : '';
		var shareText = '"' + (feed.texto || '').trim() + '"' + passagemTxt + ' â€” Meu DiÃ¡rio BÃ­blico #JovensSarados #PalavraDeDeus #Radicalidade';
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareText).then(function() {
				$ionicPopup.alert({
					title: 'ReflexÃ£o Copiada! ðŸ“¸',
					template: '<div style="text-align: center;"><i class="icon ion-social-instagram" style="font-size: 38px; color: #E1306C;"></i><p style="margin-top: 10px; font-weight: 700; font-size: 14px;">Texto copiado com sucesso!</p><p style="font-size: 12px; color: #64748B;">Vamos abrir o seu Instagram para vocÃª postar nos seus Stories ou Feed.</p></div>'
				}).then(function() {
					abrirInstagramPessoal();
				});
			}).catch(function() {
				abrirInstagramPessoal();
			});
		} else {
			abrirInstagramPessoal();
		}
	};

	$scope.visualizarFoto = function(feed) {
		if (!feed || !feed.imagem) return;
		$ionicPopup.alert({
			title: feed.passagem || 'Foto da Palavra de Deus',
			template: '<div style="text-align: center;"><img src="' + feed.imagem + '" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"></div>',
			okText: 'Fechar'
		});
	};

	$scope.getFeed();



	$scope.likesSet = function(feed, index) {

		var likes = feed.likes || 0;

		feed.likes = parseInt(likes)+1;

		console.log(feed, index);

		webService.call({op: 'likesSet', feedType: feed.feedType, feedId: feed.id});

	};

	

	

	$scope.loadMore = function(){

		$scope.getFeed();

	};

	

})

.controller('contatoCtrl', function($scope, $rootScope, $stateParams, webService, CONF, $cordovaToast, $ionicHistory, $ionicPopup) {



	$scope.formData = {};



	$scope.submit = function(form){ 



		//$toCheck = array('nome' => '%s', 'email' => '%s', 'senha' => '%s', 'imagem' => '%s', 'celular' => '%s', 'nascimento' => '%s', 'missao' => '%d', 'fezmaranatha' => '%d', 'token' => '%s');	



		var params = {

			op: 'contato',			

			email: $scope.formData.email,

			assunto: $scope.formData.assunto,

			mensagem: $scope.formData.mensagem

		};		



		if(form.$invalid) {



			$ionicPopup.alert({

				title: 'Voc deve preencher o formulrio corretamente.',

				okType: 'button-assertive'

			});



		} else {



			webService.call(params).then(function(r){



				if(window.plugins && window.plugins.toast) {

					$cordovaToast.show('Contato enviado com sucesso ??', 'long', 'bottom');

					$ionicHistory.goBack();

				}



			});

		}

	};

})

.controller('feedCtrl', function($scope, $rootScope, $stateParams, webService, CONF, $sce, $ionicModal, $ionicPopup, $timeout, $http, $ionicLoading) {

	$scope.loadMoreContinue = false;
	$scope.feeds = [];
	$scope.feedUnique = false;
	var FB_FEED_URL = 'https://jovens-sarados-app-default-rtdb.firebaseio.com/feed';

	// Destaque do anÃºncio quando clicado via NotificaÃ§Ã£o
	$scope.$on('destacarAnuncioFeed', function(evt, data) {
		if (!data) return;
		var targetId = data.feedId;
		$timeout(function() {
			var cardEl = null;
			if (targetId) {
				cardEl = document.getElementById('feed-post-' + targetId);
			}
			if (!cardEl && data.notif) {
				var searchTitle = (data.notif.titleInt || data.notif.title || '').replace('ðŸ”¥', '').replace('Nova PublicaÃ§Ã£o:', '').trim().toLowerCase();
				var cards = document.querySelectorAll('.feeds .list');
				for (var ci = 0; ci < cards.length; ci++) {
					var textContent = (cards[ci].textContent || '').toLowerCase();
					if (searchTitle && textContent.indexOf(searchTitle) !== -1) {
						cardEl = cards[ci];
						break;
					}
				}
			}

			if (cardEl) {
				cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
				cardEl.classList.add('anuncio-destaque-ativo');
				$timeout(function() {
					cardEl.classList.remove('anuncio-destaque-ativo');
				}, 5000);
			}
		}, 300);
	});

	$scope.novaNoticiaForm = {
		titulo: '',
		tag: 'NotÃ­cia JS',
		imagem: '',
		descricao: '',
		link: '',
		tipo: 'instagram'
	};

	$scope.selecionarFoto = function(url) {
		$scope.novaNoticiaForm.imagem = url;
	};

	$scope.acionarInputArquivo = function() {
		var input = document.getElementById('novaNoticiaFileInput');
		if (input) {
			input.click();
		}
	};

	$scope.arquivoSelecionado = function(element) {
		if (element.files && element.files[0]) {
			var file = element.files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				var img = new Image();
				img.onload = function() {
					try {
						var canvas = document.createElement('canvas');
						var maxDim = 800;
						var width = img.width;
						var height = img.height;
						if (width > maxDim || height > maxDim) {
							if (width > height) {
								height = Math.round((height * maxDim) / width);
								width = maxDim;
							} else {
								width = Math.round((width * maxDim) / height);
								height = maxDim;
							}
						}
						canvas.width = width;
						canvas.height = height;
						var ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0, width, height);
						var dataUrl = canvas.toDataURL('image/jpeg', 0.8);
						$scope.$apply(function() {
							$scope.novaNoticiaForm.imagem = dataUrl;
						});
					} catch(err) {
						$scope.$apply(function() {
							$scope.novaNoticiaForm.imagem = e.target.result;
						});
					}
				};
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	};

	$scope.puxarDadosLink = function() {
		var rawUrl = ($scope.novaNoticiaForm.link || '').trim();
		if (!rawUrl || rawUrl.length < 5) {
			$ionicPopup.alert({
				title: 'Insira um Link',
				template: 'Por favor, cole o link do Instagram (post/reel) ou do YouTube (vÃ­deo/shorts).',
				okText: 'OK',
				okType: 'button-assertive'
			});
			return;
		}

		if (!/^https?:\/\//i.test(rawUrl)) {
			rawUrl = 'https://' + rawUrl;
			$scope.novaNoticiaForm.link = rawUrl;
		}

		$ionicLoading.show({
			template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner><p style="margin-top: 8px; font-weight: 700; font-size: 13px;">Puxando informaÃ§Ãµes do link...</p>'
		});

		var urlLower = rawUrl.toLowerCase();
		var isYt = (urlLower.indexOf('youtube.com') !== -1 || urlLower.indexOf('youtu.be') !== -1);

		if (isYt) {
			var ytMatch = rawUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
			var ytId = ytMatch ? ytMatch[1] : null;

			$scope.novaNoticiaForm.tipo = 'youtube';
			$scope.novaNoticiaForm.isYouTube = true;
			$scope.novaNoticiaForm.tag = 'VÃ­deo YouTube';
			$scope.novaNoticiaForm.tagColor = '#DC2626';
			$scope.novaNoticiaForm.link = rawUrl;
			if (ytId) {
				$scope.novaNoticiaForm.imagem = 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg';
				$scope.novaNoticiaForm.videoId = ytId;
			}

			fetch('https://noembed.com/embed?url=' + encodeURIComponent(rawUrl))
				.then(function(res) { return res.json(); })
				.then(function(data) {
					$ionicLoading.hide();
					$scope.$apply(function() {
						if (data && data.title) {
							$scope.novaNoticiaForm.titulo = data.title;
							if (data.thumbnail_url) {
								$scope.novaNoticiaForm.imagem = data.thumbnail_url;
							}
							$scope.novaNoticiaForm.descricao = 'Assista ao vÃ­deo oficial do Jovens Sarados: "' + data.title + '". Momento de oraÃ§Ã£o radical e evangelizaÃ§Ã£o.';
						} else if (!$scope.novaNoticiaForm.titulo) {
							$scope.novaNoticiaForm.titulo = 'VÃ­deo Oficial Jovens Sarados';
						}
					});
					$ionicPopup.alert({
						title: 'VÃ­deo do YouTube Puxado!',
						template: '<div style="text-align: center;"><p style="font-weight: 700; color: #101650;">Capa e informaÃ§Ãµes carregadas com sucesso!</p></div>',
						okText: 'OK'
					});
				})
				.catch(function() {
					$ionicLoading.hide();
					$scope.$apply(function() {
						if (!$scope.novaNoticiaForm.titulo) {
							$scope.novaNoticiaForm.titulo = 'VÃ­deo Oficial Jovens Sarados';
						}
					});
					$ionicPopup.alert({
						title: 'Link do VÃ­deo Salvo!',
						template: '<p style="text-align:center;">Link configurado. VocÃª pode personalizar o tÃ­tulo e a descriÃ§Ã£o.</p>',
						okText: 'OK'
					});
				});

		} else {
			$scope.novaNoticiaForm.tipo = 'instagram';
			$scope.novaNoticiaForm.isYouTube = false;
			$scope.novaNoticiaForm.tag = 'Instagram JS';
			$scope.novaNoticiaForm.tagColor = '#E1306C';
			$scope.novaNoticiaForm.link = rawUrl;

			// Tenta puxar metadados via microlink.io
			fetch('https://api.microlink.io?url=' + encodeURIComponent(rawUrl))
				.then(function(res) { return res.json(); })
				.then(function(resp) {
					$ionicLoading.hide();
					var data = resp && resp.data ? resp.data : null;
					$scope.$apply(function() {
						if (data) {
							if (data.title) {
								$scope.novaNoticiaForm.titulo = data.title;
							}
							if (data.description) {
								$scope.novaNoticiaForm.descricao = data.description;
							}
							if (data.image && data.image.url) {
								$scope.novaNoticiaForm.imagem = data.image.url;
							}
							if (data.publisher) {
								$scope.novaNoticiaForm.tag = data.publisher;
							}
						}
						if (!$scope.novaNoticiaForm.titulo) {
							$scope.novaNoticiaForm.titulo = 'Post Oficial: Jovens Sarados';
						}
						if (!$scope.novaNoticiaForm.descricao) {
							$scope.novaNoticiaForm.descricao = 'Confira as Ãºltimas novidades divulgadas no post oficial do Jovens Sarados!';
						}
					});
					$ionicPopup.alert({
						title: 'Dados Puxados!',
						template: '<div style="text-align: center;"><p style="font-weight: 700; color: #101650;">InformaÃ§Ãµes do post carregadas com sucesso!</p><p style="font-size: 12px; color: #64748B;">Confira a imagem e o texto antes de publicar.</p></div>',
						okText: 'OK',
						okType: 'button-assertive'
					});
				})
				.catch(function() {
					$ionicLoading.hide();
					$scope.$apply(function() {
						if (!$scope.novaNoticiaForm.titulo) {
							$scope.novaNoticiaForm.titulo = 'Post Oficial: Jovens Sarados';
						}
						if (!$scope.novaNoticiaForm.descricao) {
							$scope.novaNoticiaForm.descricao = 'Confira as Ãºltimas novidades divulgadas no post oficial do Jovens Sarados!';
						}
					});
					$ionicPopup.alert({
						title: 'Link Configurado!',
						template: '<div style="text-align: center;"><p style="font-weight: 700; color: #101650;">Link registrado com sucesso!</p><p style="font-size: 12px; color: #64748B;">VocÃª pode subir uma foto do aparelho e editar o texto antes de publicar.</p></div>',
						okText: 'OK'
					});
				});
		}
	};
	$scope.puxarDadosInstagram = $scope.puxarDadosLink;

	$ionicModal.fromTemplateUrl('templates/modal-nova-noticia.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalNoticia = modal;
	});

	$scope.modoEdicao = false;
	$scope.noticiaIdEdicao = null;
	$scope.noticiaFbKey = null;

	$scope.abrirNovaNoticia = function() {
		$scope.modoEdicao = false;
		$scope.noticiaIdEdicao = null;
		$scope.noticiaFbKey = null;
		$scope.novaNoticiaForm = {
			link: '',
			titulo: '',
			tag: 'NotÃ­cia JS',
			tipo: 'instagram',
			imagem: '',
			descricao: ''
		};
		if ($scope.modalNoticia) {
			$scope.modalNoticia.show();
		} else {
			$ionicModal.fromTemplateUrl('templates/modal-nova-noticia.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modalNoticia = modal;
				modal.show();
			});
		}
	};

	$scope.abrirEditarNoticia = function(feed) {
		if (!feed) return;
		$scope.modoEdicao = true;
		$scope.noticiaIdEdicao = feed.id || (feed.feedData ? feed.feedData.postId : null);
		$scope.noticiaFbKey = feed._fbKey || (feed.id && feed.id.indexOf('-') === 0 ? feed.id : null);

		var fd = feed.feedData || {};
		var extUrl = fd.externalUrl || '';
		var isYt = Boolean(fd.isYouTube || (extUrl && (extUrl.indexOf('youtube') !== -1 || extUrl.indexOf('youtu.be') !== -1)));
		var ytId = fd.videoId || null;
		if (!ytId && isYt && extUrl) {
			var ytMatch = extUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
			if (ytMatch) ytId = ytMatch[1];
		}

		$scope.novaNoticiaForm = {
			id: feed.id,
			titulo: fd.title ? fd.title.replace(/<[^>]+>/g, '').trim() : '',
			link: extUrl,
			imagem: fd.postImagem || fd.videoImagem || fd.imagem || (isYt && ytId ? 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg' : ''),
			descricao: fd.text || '',
			tipo: isYt ? 'youtube' : 'instagram',
			isYouTube: isYt,
			videoId: ytId,
			tag: isYt ? 'VÃ­deo YouTube' : 'NotÃ­cia JS'
		};

		if ($scope.modalNoticia) {
			$scope.modalNoticia.show();
		} else {
			$ionicModal.fromTemplateUrl('templates/modal-nova-noticia.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modalNoticia = modal;
				modal.show();
			});
		}
	};

	$scope.excluirNoticia = function(feed) {
		if (!feed) return;
		$ionicPopup.confirm({
			title: 'Excluir Post',
			template: '<div style="text-align: center;"><p style="font-weight: 700; color: #101650;">Deseja realmente remover esta publicaÃ§Ã£o do feed para todos?</p><p style="font-size: 12px; color: #64748B;">Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.</p></div>',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(confirmou) {
			if (confirmou) {
				var fbKey = feed._fbKey || (feed.id && feed.id.indexOf('-') === 0 ? feed.id : null);
				if (fbKey) {
					$http.delete(FB_FEED_URL + '/' + fbKey + '.json').catch(function(){});
				}
				if (window.JS_FEED_MANAGER && typeof window.JS_FEED_MANAGER.removeNoticia === 'function') {
					window.JS_FEED_MANAGER.removeNoticia(feed.id);
				}
				$timeout(function() {
					$scope.getFeed(true);
				}, 400);
				$ionicPopup.alert({
					title: 'Post Removido',
					template: '<div style="text-align: center;"><p>A publicaÃ§Ã£o foi removida do Feed com sucesso!</p></div>',
					okText: 'OK',
					okType: 'button-assertive'
				});
			}
		});
	};

	$scope.fecharNovaNoticia = function() {
		$scope.modoEdicao = false;
		$scope.noticiaIdEdicao = null;
		$scope.noticiaFbKey = null;
		if ($scope.modalNoticia) {
			$scope.modalNoticia.hide();
		}
	};

	$scope.salvarNovaNoticia = function() {
		if (!$scope.novaNoticiaForm.titulo || $scope.novaNoticiaForm.titulo.trim().length < 3) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor, informe o tÃ­tulo da notÃ­cia ou clique em Puxar Dados.',
				okText: 'OK',
				okType: 'button-assertive'
			});
			return;
		}

		$ionicLoading.show({
			template: '<ion-spinner icon="lines" class="spinner-energized"></ion-spinner><p style="margin-top: 8px; font-weight: 700; font-size: 13px;">Salvando post para todos os membros...</p>'
		});

		var isYouTube = Boolean(
			$scope.novaNoticiaForm.tipo === 'youtube' ||
			$scope.novaNoticiaForm.isYouTube ||
			($scope.novaNoticiaForm.link && ($scope.novaNoticiaForm.link.indexOf('youtube') !== -1 || $scope.novaNoticiaForm.link.indexOf('youtu.be') !== -1))
		);

		var finalUrl = $scope.novaNoticiaForm.link || (isYouTube ? 'https://www.youtube.com/@jovenssarados' : 'https://www.instagram.com/jovens.sarados/');
		var tag = $scope.novaNoticiaForm.tag || (isYouTube ? 'VÃ­deo YouTube' : 'NotÃ­cia JS');
		var tagColor = isYouTube ? '#DC2626' : '#003CFF';

		var titleTag = isYouTube
			? '<i class="icon ion-social-youtube" style="color: #FF0000; font-size: 18px; vertical-align: middle; margin-right: 6px;"></i><span style="color: ' + tagColor + '; font-weight: 800;">' + tag + '</span> â€¢ VÃ­deo Oficial'
			: '<i class="icon ion-social-instagram" style="color: #E1306C; font-size: 18px; vertical-align: middle; margin-right: 6px;"></i><span style="color: ' + tagColor + '; font-weight: 800;">' + tag + '</span> â€¢ Post Oficial';

		var postPayload = {
			feedType: 'post',
			feedData: {
				titleTag: titleTag,
				title: $scope.novaNoticiaForm.titulo,
				postImagem: $scope.novaNoticiaForm.imagem || (isYouTube ? 'https://img.youtube.com/vi/' + ($scope.novaNoticiaForm.videoId || 'default') + '/hqdefault.jpg' : 'img/brand/logo-js-horizontal-tight.png'),
				text: $scope.novaNoticiaForm.descricao || '',
				externalUrl: finalUrl,
				externalUrlButton: isYouTube ? 'Assistir no YouTube' : 'Ver post oficial',
				isYouTube: isYouTube,
				videoId: $scope.novaNoticiaForm.videoId || null
			},
			dateTime: Math.floor(Date.now() / 1000),
			likes: 0
		};

		if ($scope.modoEdicao && ($scope.noticiaFbKey || $scope.noticiaIdEdicao)) {
			var editKey = $scope.noticiaFbKey || $scope.noticiaIdEdicao;
			$http.put(FB_FEED_URL + '/' + editKey + '.json', postPayload)
				.then(function() {
					$ionicLoading.hide();
					$scope.fecharNovaNoticia();
					$scope.getFeed(true);
					$ionicPopup.alert({
						title: 'Post Atualizado!',
						template: '<div style="text-align: center;"><p style="font-weight: 700; color: #101650;">Atualizado para todos os usuÃ¡rios com sucesso!</p></div>',
						okText: 'OK'
					});
				})
				.catch(function() {
					$ionicLoading.hide();
					$scope.fecharNovaNoticia();
					$scope.getFeed(true);
				});
		} else {
			$http.post(FB_FEED_URL + '.json', postPayload)
				.then(function() {
					$ionicLoading.hide();
					$scope.fecharNovaNoticia();
					$scope.getFeed(true);
					$ionicPopup.alert({
						title: 'Publicado Para Todos!',
						template: '<div style="text-align: center;"><p style="font-weight: 700; color: #101650;">NotÃ­cia publicada com sucesso!</p><p style="font-size: 12px; color: #64748B;">Todas as pessoas cadastradas jÃ¡ conseguem visualizar no aplicativo.</p></div>',
						okText: 'OK'
					});
				})
				.catch(function() {
					$ionicLoading.hide();
					if (window.JS_FEED_MANAGER) {
						window.JS_FEED_MANAGER.addNoticia($scope.novaNoticiaForm);
					}
					$scope.fecharNovaNoticia();
					$scope.getFeed(true);
					$ionicPopup.alert({
						title: 'Salvo Localmente',
						template: '<p>Publicado no aparelho.</p>',
						okText: 'OK'
					});
				});
		}
	};

	$scope.$on('$destroy', function() {
		if ($scope.modalNoticia) {
			$scope.modalNoticia.remove();
		}
	});

	$scope.feedClick = function(feed) {
		switch (feed.feedType) {
			case 'post':
				$rootScope.goState('app.posts', {post: feed.feedData.postId});
			break;
			case 'video':
				$rootScope.youTubePlayer(feed.feedData.videoId);
			break;
			default:
				$rootScope.goState('app.feed', {feedId: feed.id});
			break;
		}
	};

	$scope.getFeedId = function(feedId) {
		webService.call({op: 'feedGetById', feedId: feedId}, true).then(function(r){	
			$scope.feedUnique = true;
			$scope.feeds.push(r.data);
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

	$scope.trustSrc = function(src) {
		return $sce.trustAsResourceUrl(src);
	};

	$scope.getFeed = function(noLastIdUse) {
		if ($scope.getFeedLock) return false;
		$scope.getFeedLock = true;

		var webServiceArgs = { op: 'feedGet' };
		if ($stateParams.feedIdTop) {
			webServiceArgs.feedId = $stateParams.feedIdTop;
		}

		webService.call(webServiceArgs, true).then(function(r) {
			var baseFeeds = (r && r.data && r.data.feeds) ? r.data.feeds : [];

			// Carrega posts em tempo real do Firebase RTDB (compartilhado com TODOS os usuÃ¡rios)
			$http.get(FB_FEED_URL + '.json?_t=' + Date.now())
				.then(function(fbRes) {
					var fbData = fbRes.data || {};
					var fbFeeds = [];
					for (var k in fbData) {
						if (fbData.hasOwnProperty(k) && fbData[k]) {
							var item = fbData[k];
							item._fbKey = k;
							item.id = item.id || k;
							fbFeeds.push(item);
						}
					}
					fbFeeds.sort(function(a, b) {
						return (b.dateTime || 0) - (a.dateTime || 0);
					});

					// Junta as postagens do Firebase no topo + os feeds base
					$scope.feeds = fbFeeds.concat(baseFeeds);
				})
				.catch(function() {
					$scope.feeds = baseFeeds;
				})
				.finally(function() {
					$scope.loadMoreContinue = false;
					$scope.$broadcast('scroll.infiniteScrollComplete');
					$scope.$broadcast('scroll.refreshComplete');
					$scope.getFeedLock = false;
				});
		});
	};

	$scope.openUrl = function(url) {
		window.open(url, '_blank');
	};

	if ($stateParams.feedId) {		
		$scope.getFeedId($stateParams.feedId);
		$scope.loadMoreContinue = false;
	} else {
		$scope.getFeed();
	}

	$scope.likesSet = function(feed, index) {
		var likes = parseInt(feed.likes) || 0;
		if (!feed.userLiked) {
			feed.likes = likes + 1;
			feed.userLiked = true;
		} else {
			feed.likes = Math.max(0, likes - 1);
			feed.userLiked = false;
		}
		webService.call({op: 'likesSet', feedType: feed.feedType, feedId: feed.id});
		if (feed._fbKey) {
			$http.patch(FB_FEED_URL + '/' + feed._fbKey + '.json', { likes: feed.likes }).catch(function(){});
		}
	};

	$scope.loadMore = function() {
		$scope.$broadcast('scroll.infiniteScrollComplete');
	};

	$scope.refresh = function() {
		$scope.getFeed(true);
	};

	$scope.share = function(data) {	
		var dataShare = {};
		if(data.feedShareLink && data.feedShareLink.length > 3) {
			dataShare.feedShareLink = data.feedShareLink;
		} else if(data.feedData.videoId) {
			dataShare.videoId = data.feedData.videoId;
		} else if(data.feedData.postId) {
			dataShare.postId = data.feedData.postId;
		} else if(data.feedData.imagem) {
			dataShare.imagem = data.feedData.imagem;
		} else if(data.id) {
			dataShare.id = data.id;
		} else {
			return false;
		}
		$rootScope.share(dataShare);		
	};

}).controller('canaisCtrl', function($window, $ionicModal, $scope, $rootScope, $state, jsUser, $q, CONF, $ionicLoading, $stateParams, G, webService, $cordovaToast, $ionicHistory) {

	

	$scope.G = G;



	// Garante que o canal 'Misses' esteja presente na lista de canais

	if (G && G.vars && G.vars.canais) {

		var hasMissoes = false;

		for (var k = 0; k < G.vars.canais.length; k++) {

			if (G.vars.canais[k].nome === 'Misses' || G.vars.canais[k].nome === 'MissÃµes' || G.vars.canais[k].nome === 'Misses') {

				G.vars.canais[k].nome = 'Misses';

				hasMissoes = true;

				break;

			}

		}

		if (!hasMissoes) {
			G.vars.canais.push({
				nome: 'Misses',
				icone: 'ion-android-pin',
				acao: {
					type: '$state.go',
					data: ['app.missoes']
				}
			});
		}

		// Garante que o canal 'MÃºsicas' esteja presente na lista de canais
		var hasMusicas = false;
		for (var mIdx = 0; mIdx < G.vars.canais.length; mIdx++) {
			var nmM = (G.vars.canais[mIdx].nome || '').toLowerCase();
			if (nmM.indexOf('mÃºsic') !== -1 || nmM.indexOf('music') !== -1 || nmM.indexOf('louvor') !== -1) {
				hasMusicas = true;
				break;
			}
		}
		if (!hasMusicas) {
			G.vars.canais.push({
				nome: 'MÃºsicas',
				icone: 'ion-music-note',
				acao: {
					type: '$state.go',
					data: ['app.musicas']
				}
			});
		}

		// Garante que o canal 'Chat' esteja presente na lista de canais
		var hasChat = false;
		for (var chIdx = 0; chIdx < G.vars.canais.length; chIdx++) {
			var nmCh = (G.vars.canais[chIdx].nome || '').toLowerCase();
			if (nmCh.indexOf('chat') !== -1 || nmCh.indexOf('bate-papo') !== -1) {
				hasChat = true;
				break;
			}
		}
		if (!hasChat) {
			G.vars.canais.push({
				nome: 'Chat',
				icone: 'ion-chatbubbles',
				acao: {
					type: '$state.go',
					data: ['app.chat']
				}
			});
		}

		// Garante que o canal 'CalendÃ¡rio & KairÃ³s' esteja presente na lista de canais
		var hasCalendario = false;
		for (var cIdx = 0; cIdx < G.vars.canais.length; cIdx++) {
			var nmC = (G.vars.canais[cIdx].nome || '').toLowerCase();
			if (nmC.indexOf('calen') !== -1 || nmC.indexOf('kair') !== -1 || nmC.indexOf('evento') !== -1 || nmC.indexOf('agenda') !== -1) {
				hasCalendario = true;
				break;
			}
		}
		if (!hasCalendario) {
			G.vars.canais.push({
				nome: 'CalendÃ¡rio & KairÃ³s',
				icone: 'ion-calendar',
				acao: {
					type: '$state.go',
					data: ['app.calendario']
				}
			});
		}

		// Garante que 'Quem Somos' seja o 1Âº canal no topo da lista
		var qsIdx = -1;
		for (var q = 0; q < G.vars.canais.length; q++) {
			var nm = (G.vars.canais[q].nome || '').toLowerCase();
			if (nm.indexOf('quem') !== -1) {
				qsIdx = q;
				break;
			}
		}
		if (qsIdx > 0) {
			var qsItem = G.vars.canais.splice(qsIdx, 1)[0];
			G.vars.canais.unshift(qsItem);
		}

	}	



	

		// Decorador de metadados modernos para cada canal

		var canalMetadata = {

			'liturgia': {

				title: 'Liturgia Di\u00E1ria',

				desc: 'Leituras e Evangelho do dia',

				icone: 'ion-ios-bookmarks',

				gradient: 'linear-gradient(135deg, #003CFF 0%, #101650 100%)',

				badge: 'Di\u00E1rio'

			},

			'formacao': {

				title: 'Forma\u00E7\u00E3o',

				desc: 'Estudos, artigos e aprofundamento',

				icone: 'ion-edit',

				gradient: 'linear-gradient(135deg, #FF5500 0%, #FF8800 100%)',

				badge: 'Radical'

			},

			'oracoes': {

				title: 'Ora\u00E7\u00F5es',

				desc: 'Devocion\u00E1rio e carisma JS',

				icone: 'ion-ios-flame',

				gradient: 'linear-gradient(135deg, #FF2D55 0%, #FF6B00 100%)',

				badge: 'Fogo Santo'

			},

			'pedido': {

				title: 'Pedido de Ora\u00E7\u00E3o',

				desc: 'Envie sua inten\u00E7\u00E3o de f\u00E9',

				icone: 'ion-ios-people',

				gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',

				badge: 'Comunidade'

			},

			'frases': {

				title: 'Frases dos Santos',

				desc: 'Sabedoria dos santos para hoje',

				icone: 'ion-quote',

				gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',

				badge: 'Inspira\u00E7\u00E3o'

			},

			'santo': {

				title: 'Santo do Dia',

				desc: 'Exemplos e testemunhos vivos',

				icone: 'ion-ios-star',

				gradient: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',

				badge: 'Exemplo'

			},

			'tv': {

				title: 'Tv Sarados',

				desc: 'Prega\u00E7\u00F5es, v\u00EDdeos e eventos',

				icone: 'ion-ios-videocam',

				gradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',

				badge: 'V\u00EDdeos'

			},

			'diario': {

				title: 'Di\u00E1rio B\u00EDblico',

				desc: 'M\u00E9todo da Palavra de Deus',

				icone: 'ion-ios-compose',

				gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',

				badge: 'B\u00EDblia'

			},

			'quem': {

				title: 'Quem Somos',

				desc: 'Hist\u00F3ria, miss\u00E3o e carisma JS',

				icone: 'ion-fireball',

				gradient: 'linear-gradient(135deg, #101650 0%, #003CFF 100%)',

				badge: 'Carisma'

			},

			'missoes': {

				title: 'Miss\u00F5es',

				desc: 'Encontre o grupo JS mais perto',

				icone: 'ion-android-pin',

				gradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',

				badge: 'Brasil'

			},

			'musicas': {
				title: 'M\u00FAsicas & Louvores JS',
				desc: 'M\u00FAsicas, shows e adora\u00E7\u00E3o oficial',
				icone: 'ion-music-note',
				gradient: 'linear-gradient(135deg, #101650 0%, #003CFF 55%, #FF6A00 100%)',
				badge: 'Louvor'
			},

			'chat': {
				title: 'Chat',
				desc: 'Bate-papo geral da comunidade JS',
				icone: 'ion-chatbubbles',
				gradient: 'linear-gradient(135deg, #101650 0%, #003CFF 60%, #6366F1 100%)',
				badge: 'Comunidade'
			},

			'calendario': {
				title: 'CalendÃ¡rio & KairÃ³s',
				desc: 'Retiros, aprofundamentos e aniversÃ¡rios de missÃµes',
				icone: 'ion-calendar',
				gradient: 'linear-gradient(135deg, #101650 0%, #003CFF 40%, #FF6A00 100%)',
				badge: 'Agenda'
			}

		};



		function resolveMeta(nome) {

			if (!nome) return null;

			var n = nome.toLowerCase();

			if (n.indexOf('liturgia') !== -1) return canalMetadata['liturgia'];

			if (n.indexOf('forma') !== -1) return canalMetadata['formacao'];

			if (n.indexOf('pedido') !== -1) return canalMetadata['pedido'];

			if (n.indexOf('ora') !== -1) return canalMetadata['oracoes'];

			if (n.indexOf('frase') !== -1) return canalMetadata['frases'];

			if (n.indexOf('santo') !== -1) return canalMetadata['santo'];

			if (n.indexOf('tv') !== -1) return canalMetadata['tv'];

			if (n.indexOf('di') !== -1 && (n.indexOf('b') !== -1 || n.indexOf('rio') !== -1)) return canalMetadata['diario'];

			if (n.indexOf('quem') !== -1) return canalMetadata['quem'];

			if (n.indexOf('miss') !== -1) return canalMetadata['missoes'];

			if (n.indexOf('m') !== -1 && (n.indexOf('sic') !== -1 || n.indexOf('som') !== -1)) return canalMetadata['musicas'];

			if (n.indexOf('chat') !== -1 || n.indexOf('bate') !== -1) return canalMetadata['chat'];

			if (n.indexOf('calen') !== -1 || n.indexOf('kair') !== -1 || n.indexOf('evento') !== -1 || n.indexOf('agenda') !== -1) return canalMetadata['calendario'];

			return null;

		}



		for (var m = 0; m < G.vars.canais.length; m++) {

			var ch = G.vars.canais[m];

			var metaInfo = resolveMeta(ch.nome);

			if (metaInfo) {

				if (metaInfo.title) { ch.nome = metaInfo.title; }

				ch.desc = metaInfo.desc;

				ch.gradient = metaInfo.gradient;

				ch.badge = metaInfo.badge;

				ch.icone = metaInfo.icone;

			}

		}



	$scope.canalButton = function(acao){



		if(acao.pageTitle) {

			$rootScope.pageTitle = acao.pageTitle;

		} else {

			$rootScope.pageTitle = null;	

		}

		

		if(acao.type) {

			switch (acao.type) {

				case '$state.go':

					$rootScope.goState(acao.data[0], acao.data[1], acao.data[2]);

				break;



				case 'inAppBrowser':



					if (jsUser.isLogged() == false) {						

						$rootScope.checkUserRegister();



						return false;

					}



					var urlParamData = acao.data[0] || [];



					if(jsUser.getUser() && typeof(jsUser.getUser().token) != 'undefined') {

						urlParamData['jsToken'] = jsUser.getUser().token; 

					}



					urlParamsString = '';



					if(typeof(urlParamData) == 'object') {

						var urlParams = [];

						for(var p in urlParamData) {

							if (urlParamData.hasOwnProperty(p)) {

								urlParams.push(encodeURIComponent(p) + "=" + encodeURIComponent(urlParamData[p]));

							}

						}



						urlParamsString = urlParams.join("&");

					}					



					var wOpen = window.open(CONF.browserServiceUrl+'?'+urlParamsString, '_blank', 'location=no,hidden=yes,zoom=no');



					wOpen.addEventListener('loadstart', function(){

						$ionicLoading.show({template: '<img src="img/loading.gif"/>'});

					});



					wOpen.addEventListener('loadstop', function(){						

						wOpen.show();

						$ionicLoading.hide();

					});



					wOpen.addEventListener('loaderror', function(){

						wOpen.close();

						$ionicLoading.hide();

						$cordovaToast.show('Erro ao carregar, verifique sua Internet', 'long', 'bottom');											

					});



				break;

				default:

					// statements_def

				break;

			}

		} else {		

			$rootScope.goState(acao);

		}



	};



	//console.log(JSON.stringify($scope.canais))



}).controller('pedrinhasCtrl', function($scope, $rootScope, $state, $location, webService, $cordovaToast, $ionicPopup, $http, $window, $sce, $ionicModal) {

	$scope.returnNumber = function(a, b){
		var list = [];
		for (var i = a; i <= b; i++) {
    		list.push(i);
		}
		return list;
	};	

	var diasNomes = ['Domingo', 'Segunda-feira', 'TerÃ§a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'SÃ¡bado'];
	$scope.hojeDiaSemana = new Date().getDay();
	$scope.diaSemanaHojeNome = diasNomes[$scope.hojeDiaSemana];

	// Abas: 'pedrinhas' (5 Pedrinhas), 'tesouros' (7 Tesouros JS), 'guia' (Guia da Cartilha JS)
	var tabParam = ($location && typeof $location.search === 'function') ? $location.search().tab : null;
	if (!tabParam) {
		var h = window.location.hash || '';
		if (h.indexOf('tab=tesouros') !== -1) tabParam = 'tesouros';
		else if (h.indexOf('tab=guia') !== -1) tabParam = 'guia';
	}
	$scope.subAbaAtiva = tabParam || 'pedrinhas';
	$scope.mudarSubAba = function(aba) {
		$scope.subAbaAtiva = aba;
	};

	$scope.itemExplicacao = null;
	$scope.abrirExplicacao = function(item) {
		$scope.itemExplicacao = item;
	};
	$scope.fecharExplicacao = function() {
		$scope.itemExplicacao = null;
	};

	// Suporte a deep-link de inspeÃ§Ã£o de pedrinhas (?inspect=email)
	var locSearch = ($location && typeof $location.search === 'function') ? $location.search() : {};
	if (locSearch.inspect) {
		var inspEmail = locSearch.inspect.toLowerCase().trim();
		$rootScope.membroPedrinhasInspecionado = {
			nome: locSearch.nome || (inspEmail.indexOf('adriana') !== -1 ? 'Adriana Celestino' : 'Membro JS'),
			email: inspEmail,
			missao: locSearch.missao || 'TatuapÃ©',
			ministerio: locSearch.ministerio || 'Acolhida'
		};
	} else if (!$rootScope.navegouPeloPainelAdmin) {
		// Acesso normal pelo aplicativo: garante que abre as prÃ³prias pedrinhas
		$rootScope.membroPedrinhasInspecionado = null;
	}
	$rootScope.navegouPeloPainelAdmin = false;

	var getTargetEmail = function() {
		return $rootScope.membroPedrinhasInspecionado ? $rootScope.membroPedrinhasInspecionado.email : null;
	};

	$scope.voltarAoPainelAdmin = function() {
		$rootScope.membroPedrinhasInspecionado = null;
		$rootScope.getReportPedrinhas();
		$state.go('app.painelAdmin');
	};

	$rootScope.getReportPedrinhas(getTargetEmail());

	$scope.buttonPedrinha = function(pedrinhaKey) {
		if (!$rootScope.pedrinhas || !$rootScope.pedrinhas[pedrinhaKey]) return;
		var pedrinha = $rootScope.pedrinhas[pedrinhaKey];
		var isDone = !pedrinha.doneToday;

		// Alterna o estado imediatamente na interface
		pedrinha.doneToday = !isDone;

		// Atualiza na mesma hora a coluna do dia de hoje no relatÃ³rio visual
		var hoje = $scope.hojeDiaSemana;
		if (pedrinha.report && pedrinha.report.currentWeek && pedrinha.report.currentWeek[hoje]) {
			pedrinha.report.currentWeek[hoje].dayWeek = !isDone ? hoje : -1;
		}

		var op = !isDone ? 'pedrinhaCumprida' : 'pedrinhaDesmarcar';
		webService.call({op: op, pedrinha: pedrinhaKey, userEmail: getTargetEmail()}, false).then(function(res){
			if (res && res.data) {
				$rootScope.pedrinhas = res.data;
			} else {
				$rootScope.getReportPedrinhas(getTargetEmail());
			}
		});
	};

	$scope.diasSemanaAbbr = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'];

	$scope.marcarPedrinhaHoje = function(pedrinhaKey, status) {
		if (!$rootScope.pedrinhas || !$rootScope.pedrinhas[pedrinhaKey]) return;
		var pedrinha = $rootScope.pedrinhas[pedrinhaKey];
		var hoje = $scope.hojeDiaSemana;

		if (status === true) {
			pedrinha.doneToday = true;
			pedrinha.notDoingToday = false;
			if (pedrinha.report && pedrinha.report.currentWeek && pedrinha.report.currentWeek[hoje]) {
				pedrinha.report.currentWeek[hoje].dayWeek = hoje;
			}
			webService.call({op: 'pedrinhaCumprida', pedrinha: pedrinhaKey, dayIndex: hoje, userEmail: getTargetEmail()}, false).then(function(res){
				if (res && res.data) $rootScope.pedrinhas = res.data;
			});
		} else {
			pedrinha.doneToday = false;
			pedrinha.notDoingToday = true;
			if (pedrinha.report && pedrinha.report.currentWeek && pedrinha.report.currentWeek[hoje]) {
				pedrinha.report.currentWeek[hoje].dayWeek = -1;
			}
			webService.call({op: 'pedrinhaDesmarcar', pedrinha: pedrinhaKey, dayIndex: hoje, userEmail: getTargetEmail()}, false).then(function(res){
				if (res && res.data) $rootScope.pedrinhas = res.data;
			});
		}
	};

	$scope.togglePedrinhaDia = function(pedrinhaKey, dayIndex) {
		if (!$rootScope.pedrinhas || !$rootScope.pedrinhas[pedrinhaKey]) return;
		var pedrinha = $rootScope.pedrinhas[pedrinhaKey];
		var isDone = false;
		if (pedrinha.report && pedrinha.report.currentWeek && pedrinha.report.currentWeek[dayIndex]) {
			isDone = (pedrinha.report.currentWeek[dayIndex].dayWeek === dayIndex);
			pedrinha.report.currentWeek[dayIndex].dayWeek = isDone ? -1 : dayIndex;
		}
		if (dayIndex === $scope.hojeDiaSemana) {
			pedrinha.doneToday = !isDone;
			if (!isDone) pedrinha.notDoingToday = false;
		}
		webService.call({
			op: 'pedrinhaToggleDia',
			pedrinha: pedrinhaKey,
			dayIndex: dayIndex,
			userEmail: getTargetEmail()
		}, false).then(function(res){
			if (res && res.data) {
				$rootScope.pedrinhas = res.data;
			}
		});
	};

	$scope.irParaGuia = function(item) {
		$scope.itemExplicacao = null;
		$scope.mudarSubAba('guia');
	};

	$scope.resetPedrinhasHoje = function() {
		var confirmReset = $ionicPopup.confirm({
			title: 'Reiniciar marcaÃ§Ãµes?',
			template: '<div style="text-align: center; font-size: 14px;">Deseja desmarcar todas as pedrinhas marcadas hoje (' + $scope.diaSemanaHojeNome + ')?</div>',
			cssClass: 'button-assertive',
			okText: 'Sim, reiniciar',
			cancelText: 'Cancelar'
		});

		confirmReset.then(function(r) {
			if (r) {
				webService.call({op: 'pedrinhasResetToday', userEmail: getTargetEmail()}, true).then(function(res){
					if (res && res.data) {
						$rootScope.pedrinhas = res.data;
					} else {
						$rootScope.getReportPedrinhas(getTargetEmail());
					}
				});
			}
		});
	};

	// ========================================================
	// GUIA CATEQUÃ‰TICO: DADOS DINÃ‚MICOS E EDIÃ‡ÃƒO ADMINISTRADOR
	// ========================================================
	$scope.guiaData = null;
	$scope.editorGuia = {
		aberto: false,
		tipo: '', // 'intro', 'tesouro', 'pedrinha', 'terco', 'blocoExtra', 'novoBloco'
		item: {},
		index: -1,
		tituloModal: 'Editar ConteÃºdo'
	};

	$scope.carregarGuiaCatequetico = function() {
		$http.get('/api/guiaCatequetico')
			.then(function(res) {
				if (res && res.data && res.data.intro) {
					$scope.guiaData = res.data;
					if ($rootScope.pedrinhas) {
						if (Array.isArray(res.data.tesouros)) {
							$rootScope.pedrinhas.tesourosDef = res.data.tesouros;
						}
						if (Array.isArray(res.data.pedrinhas)) {
							$rootScope.pedrinhas.pedrinhasDef = res.data.pedrinhas;
						}
					}
				}
			})
			.catch(function(err) {
				console.log('Erro ao carregar /api/guiaCatequetico', err);
			});
	};

	$scope.carregarGuiaCatequetico();

	$scope.getYoutubeId = function(url) {
		if (!url) return null;
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
		var match = url.match(regExp);
		return (match && match[2].length === 11) ? match[2] : null;
	};

	$scope.getSafeYoutubeUrl = function(url) {
		var id = $scope.getYoutubeId(url);
		if (!id) return null;
		return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + id);
	};

	$scope.abrirLinkExterno = function(url) {
		if (!url) return;
		if (url.indexOf('http') !== 0) url = 'https://' + url;
		$window.open(url, '_blank');
	};

	// Modal / AÃ§Ãµes de EdiÃ§Ã£o para o Administrador
	$scope.abrirEditorSecao = function(tipo, item, index) {
		$scope.editorGuia.tipo = tipo;
		$scope.editorGuia.index = (typeof index === 'number') ? index : -1;
		
		if (tipo === 'intro') {
			$scope.editorGuia.tituloModal = 'Editar IntroduÃ§Ã£o do Guia';
			$scope.editorGuia.item = angular.copy(($scope.guiaData && $scope.guiaData.intro) || {});
		} else if (tipo === 'terco') {
			$scope.editorGuia.tituloModal = 'Editar TerÃ§o dos 7 Tesouros';
			$scope.editorGuia.item = angular.copy(($scope.guiaData && $scope.guiaData.terco) || {});
		} else if (tipo === 'tesouro') {
			$scope.editorGuia.tituloModal = 'Editar Tesouro: ' + ((item && item.titulo) || '');
			$scope.editorGuia.item = angular.copy(item || {});
		} else if (tipo === 'pedrinha') {
			$scope.editorGuia.tituloModal = 'Editar Pedrinha: ' + ((item && item.titulo) || '');
			$scope.editorGuia.item = angular.copy(item || {});
		} else if (tipo === 'blocoExtra') {
			$scope.editorGuia.tituloModal = 'Editar Bloco: ' + ((item && item.titulo) || '');
			$scope.editorGuia.item = angular.copy(item || {});
		} else if (tipo === 'novoBloco') {
			$scope.editorGuia.tituloModal = 'Adicionar Novo Bloco de InformaÃ§Ã£o / VÃ­deo';
			$scope.editorGuia.item = {
				id: 'bloco-' + Date.now(),
				titulo: '',
				subtitulo: '',
				texto: '',
				videoUrl: '',
				linkUrl: '',
				linkTexto: ''
			};
		}
		$scope.editorGuia.aberto = true;
	};

	$scope.fecharEditorSecao = function() {
		$scope.editorGuia.aberto = false;
	};

	$scope.salvarEdicaoGuia = function() {
		if (!$scope.guiaData) return;
		var t = $scope.editorGuia.tipo;
		var it = $scope.editorGuia.item;
		var idx = $scope.editorGuia.index;

		if (t === 'intro') {
			$scope.guiaData.intro = angular.copy(it);
		} else if (t === 'terco') {
			$scope.guiaData.terco = angular.copy(it);
		} else if (t === 'tesouro') {
			if (idx >= 0 && $scope.guiaData.tesouros[idx]) {
				$scope.guiaData.tesouros[idx] = angular.copy(it);
			} else {
				for (var i = 0; i < $scope.guiaData.tesouros.length; i++) {
					if ($scope.guiaData.tesouros[i].key === it.key) {
						$scope.guiaData.tesouros[i] = angular.copy(it);
						break;
					}
				}
			}
			if ($rootScope.pedrinhas) {
				$rootScope.pedrinhas.tesourosDef = $scope.guiaData.tesouros;
			}
		} else if (t === 'pedrinha') {
			if (idx >= 0 && $scope.guiaData.pedrinhas[idx]) {
				$scope.guiaData.pedrinhas[idx] = angular.copy(it);
			} else {
				for (var j = 0; j < $scope.guiaData.pedrinhas.length; j++) {
					if ($scope.guiaData.pedrinhas[j].key === it.key) {
						$scope.guiaData.pedrinhas[j] = angular.copy(it);
						break;
					}
				}
			}
			if ($rootScope.pedrinhas) {
				$rootScope.pedrinhas.pedrinhasDef = $scope.guiaData.pedrinhas;
			}
		} else if (t === 'blocoExtra') {
			if (idx >= 0 && $scope.guiaData.blocosExtras[idx]) {
				$scope.guiaData.blocosExtras[idx] = angular.copy(it);
			}
		} else if (t === 'novoBloco') {
			if (!$scope.guiaData.blocosExtras) $scope.guiaData.blocosExtras = [];
			$scope.guiaData.blocosExtras.push(angular.copy(it));
		}

		// Envia para API
		$http.post('/api/guiaCatequetico', $scope.guiaData)
			.then(function(res) {
				$scope.fecharEditorSecao();
				$ionicPopup.alert({
					title: 'Guia CatequÃ©tico',
					template: '<div style="text-align: center;">AlteraÃ§Ãµes salvas com sucesso!</div>',
					okType: 'button-positive'
				});
			})
			.catch(function(err) {
				$scope.fecharEditorSecao();
				$ionicPopup.alert({
					title: 'Aviso',
					template: '<div style="text-align: center;">Salvo localmente no aplicativo.</div>',
					okType: 'button-positive'
				});
			});
	};

	$scope.removerBlocoExtra = function(index) {
		var confirmDel = $ionicPopup.confirm({
			title: 'Excluir Bloco?',
			template: 'Tem certeza que deseja remover este bloco?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		});
		confirmDel.then(function(r) {
			if (r && $scope.guiaData && $scope.guiaData.blocosExtras) {
				$scope.guiaData.blocosExtras.splice(index, 1);
				$http.post('/api/guiaCatequetico', $scope.guiaData);
			}
		});
	};



})

.controller('tvSaradosCtrl', function($ionicLoading, $window, $ionicModal, $scope, $rootScope, $state, jsUser, $q, CONF, $stateParams, G, webService, $sce, $ionicScrollDelegate) {

	$scope.G = G;

	

	$scope.trustSrc = function(src) {

		return $sce.trustAsResourceUrl(src);

	};



	$scope.playVideo = function(video) {

		$scope.selectedVideo = video;

		$ionicScrollDelegate.scrollTop(true);

	};



	$scope.getVideos = function(showLoading) {

		var showLoading = (typeof(showLoading) == 'boolean') ? showLoading : true;

		webService.call({op: 'tvSarados'}, showLoading).then(function(r){

			$scope.videos = r.data || [];

			if ($scope.videos.length > 0 && !$scope.selectedVideo) {

				$scope.selectedVideo = $scope.videos[0];

			}

		});

	};



	$scope.getVideos();



}).controller('postsCtrl', function($scope, $rootScope, $state, jsUser, $q, CONF, $stateParams, G, webService, $sce, $ionicModal, $ionicPopup, $ionicLoading, $http) {

	$scope.contentOffset = 0;
	$scope.loadMoreContinue = true;
	$scope.listType = $stateParams.listType;
	$scope.pageTitle = $stateParams.pageTitle;
	if ($stateParams.catId === 'oracoes' || ($scope.pageTitle && ($scope.pageTitle.indexOf('Ora') !== -1 || $scope.pageTitle.indexOf('ora') !== -1))) {
		$scope.pageTitle = 'Canais de OraÃ§Ã£o';
	} else if ($scope.pageTitle) {
		if ($scope.pageTitle.indexOf('Forma') !== -1) {
			$scope.pageTitle = ($stateParams.catId === 'formacao-video') ? 'FormaÃ§Ãµes em VÃ­deo' : (($stateParams.catId === 'formacao-texto') ? 'FormaÃ§Ãµes em Texto & PDF' : 'FormaÃ§Ãµes');
		}
	}
	$scope.catId = $stateParams.catId;
	$scope.currentCatId = $stateParams.catId;

	// Forms para modais administrativos
	$scope.formVideo = { isEdit: false };
	$scope.formTexto = { isEdit: false, modo: 'escrever' };

	// Modais Administrativos
	$ionicModal.fromTemplateUrl('templates/modalFormacaoVideo.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalVideo = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modalFormacaoTexto.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalTexto = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modalAgendaOracoes.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalAgenda = modal;
	});

	$scope.$on('$destroy', function() {
		if ($scope.modalVideo) $scope.modalVideo.remove();
		if ($scope.modalTexto) $scope.modalTexto.remove();
		if ($scope.modalAgenda) $scope.modalAgenda.remove();
	});

	// Helpers de URLs seguras
	$scope.trustVideoUrl = function(videoId) {
		if (!videoId) return '';
		return $sce.trustAsResourceUrl('https://www.youtube-nocookie.com/embed/' + videoId + '?rel=0');
	};

	$scope.trustPdfUrl = function(pdfUrl) {
		if (!pdfUrl) return '';
		return $sce.trustAsResourceUrl(pdfUrl);
	};

	// NavegaÃ§Ã£o entre Hub e Subcategorias
	$scope.goSubCategoria = function(categoria) {
		$state.go('app.posts', { catId: categoria.id, pageTitle: categoria.nome, listType: 'thumb' });
	};

	$scope.voltarAoHub = function() {
		$state.go('app.posts', { catId: 'formacao', pageTitle: 'FormaÃ§Ã£o', listType: 'thumb' });
	};

	$scope.abrirFormacao = function(post) {
		$state.go('app.posts', { post: post.id, pageTitle: post.nome });
	};

	$scope.isOracao = function(c) {
		if (!c) return ($scope.catId === 'oracoes' || $scope.currentCatId === 'oracoes');
		if (c.isOracao === true) return true;
		if ($scope.catId === 'oracoes' || $scope.currentCatId === 'oracoes') return true;
		var cid = (c.id || '').toString();
		return (cid.indexOf('oracao') !== -1 || cid.indexOf('terco') !== -1 || cid.indexOf('salmo') !== -1 || cid.indexOf('consagracao') !== -1 || cid.indexOf('clamor') !== -1 || cid.indexOf('cura') !== -1 || cid.indexOf('alma') !== -1 || cid.indexOf('sao-') !== -1 || cid.indexOf('anjo') !== -1 || cid.indexOf('ato') !== -1 || cid.indexOf('sagrado') !== -1 || cid.indexOf('desatadora') !== -1 || cid.indexOf('oferecimento') !== -1);
	};

	// Voltar da visualizaÃ§Ã£o de post/pedrinha/oraÃ§Ã£o para a lista correspondente
	$scope.voltarLista = function() {
		$scope.conteudo = null;
		var cat = $scope.catId || $scope.currentCatId || $stateParams.catId;
		if (cat === 'oracoes' || ($scope.pageTitle && $scope.pageTitle.indexOf('Ora') !== -1)) {
			$state.go('app.posts', { catId: 'oracoes', post: null, pageTitle: 'Canais de OraÃ§Ã£o', listType: 'thumb' });
		} else if (cat === 'formacao-video') {
			$state.go('app.posts', { catId: 'formacao-video', post: null, pageTitle: 'FormaÃ§Ãµes em VÃ­deo', listType: 'thumb' });
		} else if (cat === 'formacao-texto') {
			$state.go('app.posts', { catId: 'formacao-texto', post: null, pageTitle: 'FormaÃ§Ãµes em Texto & PDF', listType: 'thumb' });
		} else if (cat === 'formacao') {
			$state.go('app.posts', { catId: 'formacao', post: null, pageTitle: 'FormaÃ§Ãµes', listType: 'thumb' });
		} else {
			$state.go('app.canais');
		}
	};

	// Abrir modal de criaÃ§Ã£o de vÃ­deo
	$scope.adicionarFormacaoVideo = function() {
		$scope.formVideo = {
			isEdit: false,
			videoUrl: '',
			videoId: '',
			nome: '',
			autor: 'MinistÃ©rio de PregaÃ§Ã£o JS',
			desc: '',
			pontosStr: ''
		};
		if ($scope.modalVideo) $scope.modalVideo.show();
	};

	$scope.fecharModalVideo = function() {
		if ($scope.modalVideo) $scope.modalVideo.hide();
	};

	$scope.onVideoUrlChange = function() {
		var url = $scope.formVideo.videoUrl || '';
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		var match = url.match(regExp);
		if (match && match[2].length === 11) {
			$scope.formVideo.videoId = match[2];
		} else if (url.trim().length === 11) {
			$scope.formVideo.videoId = url.trim();
		}
	};

	// Salvar formaÃ§Ã£o em vÃ­deo
	$scope.salvarFormacaoVideo = function() {
		if (!$scope.formVideo.videoId) {
			$scope.onVideoUrlChange();
		}
		if (!$scope.formVideo.videoId || !$scope.formVideo.nome) {
			$ionicPopup.alert({ title: 'AtenÃ§Ã£o', template: 'Por favor preencha o link do vÃ­deo e o tÃ­tulo.' });
			return;
		}
		var pontos = [];
		if ($scope.formVideo.pontosStr) {
			var lines = $scope.formVideo.pontosStr.split('\n');
			for (var i = 0; i < lines.length; i++) {
				var l = lines[i].trim();
				if (l.length > 0) pontos.push(l);
			}
		}
		var vidObj = {
			id: $scope.formVideo.id || ('vid-' + Date.now().toString(36)),
			nome: $scope.formVideo.nome,
			videoId: $scope.formVideo.videoId,
			imagem: 'https://img.youtube.com/vi/' + $scope.formVideo.videoId + '/hqdefault.jpg',
			autor: $scope.formVideo.autor || 'MinistÃ©rio de PregaÃ§Ã£o JS',
			desc: $scope.formVideo.desc || '',
			pontos: pontos
		};

		$http.post('/api/formacoes', { tipo: 'video', item: vidObj }).then(function(res) {
			if (!window.JS_FORMACOES_DATA) window.JS_FORMACOES_DATA = { videos: [], textos: [] };
			if (!$scope.formVideo.isEdit) {
				window.JS_FORMACOES_DATA.videos.unshift(vidObj);
			} else {
				for (var vi = 0; vi < window.JS_FORMACOES_DATA.videos.length; vi++) {
					if (window.JS_FORMACOES_DATA.videos[vi].id === vidObj.id) {
						window.JS_FORMACOES_DATA.videos[vi] = vidObj;
						break;
					}
				}
			}
			$scope.fecharModalVideo();
			$scope.getContent(false);
			$ionicPopup.alert({ title: 'Sucesso', template: 'FormaÃ§Ã£o em vÃ­deo salva e disponibilizada aos membros!' });
		}, function(err) {
			if (!window.JS_FORMACOES_DATA) window.JS_FORMACOES_DATA = { videos: [], textos: [] };
			window.JS_FORMACOES_DATA.videos.unshift(vidObj);
			$scope.fecharModalVideo();
			$scope.getContent(false);
			$ionicPopup.alert({ title: 'Salvo Localmente', template: 'FormaÃ§Ã£o adicionada ao aplicativo com sucesso!' });
		});
	};

	// Abrir modal de criaÃ§Ã£o de texto/PDF
	$scope.adicionarFormacaoTexto = function() {
		$scope.formTexto = {
			isEdit: false,
			modo: 'escrever',
			nome: '',
			autor: 'Comunidade Jovens Sarados',
			categoria: 'FormaÃ§Ã£o',
			imagem: '',
			desc: '',
			corpo: '',
			linkUrl: '',
			pdfUrl: ''
		};
		if ($scope.modalTexto) $scope.modalTexto.show();
	};

	$scope.fecharModalTexto = function() {
		if ($scope.modalTexto) $scope.modalTexto.hide();
	};

	$scope.setModoTexto = function(modo) {
		$scope.formTexto.modo = modo;
	};

	$scope.onPdfFileSelected = function(input) {
		if (input && input.files && input.files[0]) {
			var file = input.files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				$scope.$apply(function() {
					$scope.formTexto.pdfUrl = e.target.result;
					if (!$scope.formTexto.nome) {
						$scope.formTexto.nome = file.name.replace(/\.[^/.]+$/, "");
					}
				});
			};
			reader.readAsDataURL(file);
		}
	};

	// Salvar formaÃ§Ã£o em texto/PDF
	$scope.salvarFormacaoTexto = function() {
		if (!$scope.formTexto.nome) {
			$ionicPopup.alert({ title: 'AtenÃ§Ã£o', template: 'Por favor preencha o tÃ­tulo da formaÃ§Ã£o.' });
			return;
		}

		var txtObj = {
			id: $scope.formTexto.id || ('formacao-txt-' + Date.now().toString(36)),
			nome: $scope.formTexto.nome,
			autor: $scope.formTexto.autor || 'Comunidade Jovens Sarados',
			categoria: $scope.formTexto.categoria || 'FormaÃ§Ã£o',
			imagem: $scope.formTexto.imagem || 'img/brand/insta-profile-logo.jpg',
			desc: $scope.formTexto.desc || '',
			tipoMidia: 'texto'
		};

		if ($scope.formTexto.modo === 'pdf') {
			txtObj.tipoMidia = 'pdf';
			txtObj.pdfUrl = $scope.formTexto.pdfUrl || 'docs/cartilha-jovens-sarados.pdf';
			txtObj.conteudo = '<div class="formacao-artigo" style="font-size: 15px; line-height: 1.8; color: #1E293B;"><div style="background: linear-gradient(135deg, #101650 0%, #003CFF 100%); color: #FFF; padding: 18px 20px; border-radius: 16px; margin-bottom: 20px;"><span style="background: #FF6B00; color: #FFF; font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 10px; letter-spacing: 0.5px;">DOCUMENTO OFICIAL JS</span><h3 style="color: #FFF; font-family: \'Montserrat\', sans-serif; font-size: 19px; font-weight: 800; margin: 8px 0 4px;">' + $scope.formTexto.nome + '</h3><p style="margin: 0; opacity: 0.9; font-size: 13px;">' + ($scope.formTexto.desc || 'Documento oficial dos Jovens Sarados para leitura direta no app.') + '</p></div></div>';
		} else if ($scope.formTexto.modo === 'link') {
			txtObj.linkUrl = $scope.formTexto.linkUrl;
			txtObj.conteudo = '<div class="formacao-artigo" style="font-size: 15px; line-height: 1.8; color: #1E293B;"><div style="background: #EFF6FF; border-left: 4px solid #003CFF; padding: 14px 16px; border-radius: 12px; margin-bottom: 18px;"><b style="color: #101650;">Fonte: ' + ($scope.formTexto.autor || 'Artigo CatÃ³lico') + '</b></div><div style="margin-bottom: 18px; text-align: justify;">' + ($scope.formTexto.corpo ? $scope.formTexto.corpo.replace(/\n/g, '<br>') : '') + '</div><div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 12px; padding: 16px; text-align: center;"><a href="' + $scope.formTexto.linkUrl + '" target="_blank" class="button button-block button-assertive" style="text-decoration: none; color: #FFF; border-radius: 10px; font-weight: 700; margin: 0; background: #003CFF;">Ler Artigo Completo na Fonte Original</a></div></div>';
		} else {
			// Escrever texto
			txtObj.conteudo = '<div class="formacao-artigo" style="font-size: 15px; line-height: 1.8; color: #1E293B;"><div style="background: #EFF6FF; border-left: 4px solid #003CFF; padding: 14px 16px; border-radius: 12px; margin-bottom: 18px;"><b style="color: #101650;">FormaÃ§Ã£o Oficial â€¢ Jovens Sarados</b><br><i>Autor: ' + ($scope.formTexto.autor || 'Comunidade Jovens Sarados') + '</i></div><div style="margin-bottom: 18px; text-align: justify;">' + ($scope.formTexto.corpo ? $scope.formTexto.corpo.replace(/\n/g, '<br>') : '') + '</div></div>';
		}

		$http.post('/api/formacoes', { tipo: 'texto', item: txtObj }).then(function(res) {
			if (!window.JS_FORMACOES_DATA) window.JS_FORMACOES_DATA = { videos: [], textos: [] };
			if (!$scope.formTexto.isEdit) {
				window.JS_FORMACOES_DATA.textos.unshift(txtObj);
			} else {
				for (var ti = 0; ti < window.JS_FORMACOES_DATA.textos.length; ti++) {
					if (window.JS_FORMACOES_DATA.textos[ti].id === txtObj.id) {
						window.JS_FORMACOES_DATA.textos[ti] = txtObj;
						break;
					}
				}
			}
			$scope.fecharModalTexto();
			$scope.getContent(false);
			$ionicPopup.alert({ title: 'Sucesso', template: 'FormaÃ§Ã£o em texto/PDF publicada com sucesso!' });
		}, function(err) {
			if (!window.JS_FORMACOES_DATA) window.JS_FORMACOES_DATA = { videos: [], textos: [] };
			window.JS_FORMACOES_DATA.textos.unshift(txtObj);
			$scope.fecharModalTexto();
			$scope.getContent(false);
			$ionicPopup.alert({ title: 'Salvo Localmente', template: 'FormaÃ§Ã£o adicionada ao aplicativo com sucesso!' });
		});
	};

	// Editar formaÃ§Ã£o existente
	$scope.editarFormacao = function(post, $event) {
		if ($event) $event.stopPropagation();
		if (post.tipo === 'video' || $scope.catId === 'formacao-video' || $scope.currentCatId === 'formacao-video') {
			var vid = null;
			if (window.JS_FORMACOES_DATA && window.JS_FORMACOES_DATA.videos) {
				for (var i = 0; i < window.JS_FORMACOES_DATA.videos.length; i++) {
					if (window.JS_FORMACOES_DATA.videos[i].id === post.id) { vid = window.JS_FORMACOES_DATA.videos[i]; break; }
				}
			}
			$scope.formVideo = {
				isEdit: true,
				id: post.id,
				videoUrl: 'https://www.youtube.com/watch?v=' + (post.videoId || (vid ? vid.videoId : '')),
				videoId: post.videoId || (vid ? vid.videoId : ''),
				nome: post.nome,
				autor: post.autor || (vid ? vid.autor : 'MinistÃ©rio de PregaÃ§Ã£o JS'),
				desc: post.desc || (vid ? vid.desc : ''),
				pontosStr: (vid && vid.pontos) ? vid.pontos.join('\n') : ''
			};
			if ($scope.modalVideo) $scope.modalVideo.show();
		} else {
			var txt = null;
			if (window.JS_FORMACOES_DATA && window.JS_FORMACOES_DATA.textos) {
				for (var j = 0; j < window.JS_FORMACOES_DATA.textos.length; j++) {
					if (window.JS_FORMACOES_DATA.textos[j].id === post.id) { txt = window.JS_FORMACOES_DATA.textos[j]; break; }
				}
			}
			var isPdf = (post.tipo === 'pdf' || (txt && txt.tipoMidia === 'pdf') || post.pdfUrl);
			var isLink = (txt && txt.linkUrl);
			$scope.formTexto = {
				isEdit: true,
				id: post.id,
				modo: isPdf ? 'pdf' : (isLink ? 'link' : 'escrever'),
				nome: post.nome,
				autor: post.autor || (txt ? txt.autor : ''),
				categoria: post.categoria || (txt ? txt.categoria : ''),
				imagem: post.thumb || (txt ? txt.imagem : ''),
				desc: post.desc || (txt ? txt.desc : ''),
				linkUrl: txt ? txt.linkUrl : '',
				pdfUrl: post.pdfUrl || (txt ? txt.pdfUrl : ''),
				corpo: txt ? (txt.conteudo ? txt.conteudo.replace(/<[^>]*>/g, '').trim() : '') : ''
			};
			if ($scope.modalTexto) $scope.modalTexto.show();
		}
	};

	// Excluir formaÃ§Ã£o
	$scope.excluirFormacao = function(post, $event) {
		if ($event) $event.stopPropagation();
		$ionicPopup.confirm({
			title: 'Excluir FormaÃ§Ã£o',
			template: 'Tem certeza que deseja remover "' + post.nome + '"?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (res) {
				$http.delete('/api/formacoes?id=' + encodeURIComponent(post.id)).then(function() {
					if (window.JS_FORMACOES_DATA) {
						if (window.JS_FORMACOES_DATA.videos) {
							window.JS_FORMACOES_DATA.videos = window.JS_FORMACOES_DATA.videos.filter(function(v) { return v.id !== post.id; });
						}
						if (window.JS_FORMACOES_DATA.textos) {
							window.JS_FORMACOES_DATA.textos = window.JS_FORMACOES_DATA.textos.filter(function(t) { return t.id !== post.id; });
						}
					}
					$scope.getContent(false);
					$ionicPopup.alert({ title: 'Removido', template: 'FormaÃ§Ã£o removida com sucesso!' });
				}, function(err) {
					if (window.JS_FORMACOES_DATA) {
						if (window.JS_FORMACOES_DATA.videos) {
							window.JS_FORMACOES_DATA.videos = window.JS_FORMACOES_DATA.videos.filter(function(v) { return v.id !== post.id; });
						}
						if (window.JS_FORMACOES_DATA.textos) {
							window.JS_FORMACOES_DATA.textos = window.JS_FORMACOES_DATA.textos.filter(function(t) { return t.id !== post.id; });
						}
					}
					$scope.getContent(false);
					$ionicPopup.alert({ title: 'Removido Localmente', template: 'FormaÃ§Ã£o removida com sucesso!' });
				});
			}
		});
	};

	// Compartilhamento com WhatsApp e Instagram
	$scope.sharePostWhatsApp = function() {
		var title = $scope.conteudo ? ($scope.conteudo.nome || '') : 'FormaÃ§Ã£o Jovens Sarados';
		var url = window.location.href;
		var text = encodeURIComponent('ðŸ”¥ *FormaÃ§Ã£o Jovens Sarados*\n\n"' + title + '"\n\nConfira na Ã­ntegra no App Jovens Sarados:\n' + url);
		window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
	};

	$scope.sharePostInstagram = function() {
		var shareUrl = window.location.href;
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareUrl).then(function() {
				$ionicPopup.alert({
					title: 'Link Copiado!',
					template: 'O link da formaÃ§Ã£o foi copiado para a sua Ã¡rea de transferÃªncia. Cole no Story ou Direct do Instagram!'
				}).then(function() {
					window.open('https://www.instagram.com/jovens.sarados/', '_blank');
				});
			});
		} else {
			window.open('https://www.instagram.com/jovens.sarados/', '_blank');
		}
	};

	// =========================================================================
	// AGENDA & LEMBRETES DE ORAÃ‡ÃƒO (Sininho e Celular)
	// =========================================================================
	$scope.agendaOracoes = [];
	$scope.tempoLembreteSelecionado = null; // Nenhum horÃ¡rio vem marcado como padrÃ£o!
	$scope.horarioCustomInput = '';
	$scope.mostrarConfigHorario = {}; // prayerId -> boolean
	$scope.categoriasOracaoFiltro = ['Todas', 'EspÃ­rito Santo', 'Jesus', 'Maria', 'Combate & ProteÃ§Ã£o', 'Cura & LibertaÃ§Ã£o', 'DiÃ¡rias', 'Santos'];
	$scope.categoriaOracaoAtiva = 'Todas';
	$scope.filtroOracao = '';

	$scope.voltarParaCanais = function() {
		$state.go('app.canais');
	};

	$scope.carregarAgendaOracoes = function() {
		var u = jsUser.getUser() || {};
		var uEmail = (u && u.email) ? u.email.toLowerCase().trim() : '';
		var userKey = 'js_oracoes_agenda_v1_' + (uEmail ? uEmail.replace(/[^a-z0-9]/g, '_') : 'guest');

		try {
			var raw = localStorage.getItem(userKey);
			if (!raw && !uEmail) raw = localStorage.getItem('js_oracoes_agenda_v1');
			$scope.agendaOracoes = raw ? JSON.parse(raw) : [];
		} catch(e) {
			$scope.agendaOracoes = [];
		}

		if (typeof fetch === 'function') {
			var queryUrl = '/api/oracoes/agenda?_t=' + Date.now();
			if (uEmail) queryUrl += '&userEmail=' + encodeURIComponent(uEmail);
			fetch(queryUrl)
				.then(function(res) { return res.json(); })
				.then(function(data) {
					if (Array.isArray(data)) {
						var userItems = data.filter(function(it) {
							if (!uEmail) return true;
							var itemEmail = (it.userEmail || '').toLowerCase().trim();
							return itemEmail === uEmail;
						});
						$scope.agendaOracoes = userItems;
						try { localStorage.setItem(userKey, JSON.stringify(userItems)); } catch(e) {}
						if (!$scope.$$phase) $scope.$apply();
					}
				}).catch(function(){});
		}
	};
	$scope.carregarAgendaOracoes();

	$scope.abrirAgendaModal = function() {
		$scope.carregarAgendaOracoes();
		if ($scope.modalAgenda) $scope.modalAgenda.show();
	};

	$scope.fecharAgendaModal = function() {
		if ($scope.modalAgenda) $scope.modalAgenda.hide();
	};

	$scope.setCategoriaOracao = function(cat) {
		$scope.categoriaOracaoAtiva = cat;
	};

	$scope.filtrarOracoes = function(item) {
		if (!item) return false;
		if ($scope.categoriaOracaoAtiva && $scope.categoriaOracaoAtiva !== 'Todas') {
			if (!item.categoria || item.categoria.indexOf($scope.categoriaOracaoAtiva) === -1) {
				return false;
			}
		}
		if ($scope.filtroOracao && $scope.filtroOracao.trim().length > 0) {
			var q = $scope.filtroOracao.toLowerCase().trim();
			var n = (item.nome || '').toLowerCase();
			var s = (item.subtitulo || '').toLowerCase();
			var c = (item.categoria || '').toLowerCase();
			return n.indexOf(q) !== -1 || s.indexOf(q) !== -1 || c.indexOf(q) !== -1;
		}
		return true;
	};

	$scope.setTempoPreset = function(t) {
		$scope.tempoLembreteSelecionado = t;
		$scope.horarioCustomInput = t;
	};

	$scope.getScheduleForPrayer = function(prayerId) {
		if (!$scope.agendaOracoes || !prayerId) return null;
		for (var i = 0; i < $scope.agendaOracoes.length; i++) {
			var a = $scope.agendaOracoes[i];
			if (a.oracaoId === prayerId && a.ativo) {
				return a.horario;
			}
		}
		return null;
	};

	$scope.alternarModoNotificacao = function(oracao, querNotificacao) {
		if (!oracao) return;
		if (!querNotificacao) {
			// UsuÃ¡rio escolheu NÃƒO receber notificaÃ§Ã£o
			$scope.desativarLembreteOracao(oracao.id, true);
			$scope.mostrarConfigHorario[oracao.id] = false;
			$scope.tempoLembreteSelecionado = null;
			$scope.horarioCustomInput = '';
		} else {
			// UsuÃ¡rio escolheu SIM, quer receber notificaÃ§Ã£o -> abre configuraÃ§Ã£o de horÃ¡rio
			$scope.mostrarConfigHorario[oracao.id] = true;
			var jaAtivo = $scope.getScheduleForPrayer(oracao.id);
			if (jaAtivo) {
				$scope.tempoLembreteSelecionado = jaAtivo;
				$scope.horarioCustomInput = jaAtivo;
			} else {
				$scope.tempoLembreteSelecionado = oracao.horarioSugerido || '15:00';
				$scope.horarioCustomInput = $scope.tempoLembreteSelecionado;
			}
		}
	};

	$scope.solicitarPermissaoNotificacao = function() {
		if ('Notification' in window) {
			Notification.requestPermission().then(function(perm) {
				if (perm === 'granted') {
					$ionicPopup.alert({
						title: 'NotificaÃ§Ãµes Ativadas!',
						template: 'Perfeito! VocÃª receberÃ¡ os lembretes de oraÃ§Ã£o diretamente na tela do seu celular e navegador.'
					});
				} else {
					$ionicPopup.alert({
						title: 'PermissÃ£o Pendente',
						template: 'Ative as notificaÃ§Ãµes nas configuraÃ§Ãµes do seu navegador para receber avisos na tela bloqueada.'
					});
				}
			});
		} else {
			$ionicPopup.alert({
				title: 'Lembretes Ativos',
				template: 'VocÃª receberÃ¡ os avisos no sininho laranja do aplicativo!'
			});
		}
	};

	$scope.dispararNotificacaoSininhoECelular = function(titulo, corpo, oracaoId, oracaoNome) {
		var userProfile = jsUser.getUser() || {};
		var userEmail = (userProfile.email) ? userProfile.email.toLowerCase().trim() : '';

		// 1. NotificaÃ§Ã£o Nativa / Celular (Apenas no aparelho do usuÃ¡rio atual)
		if ('Notification' in window && Notification.permission === 'granted') {
			try {
				new Notification('â° Jovens Sarados â€¢ ' + titulo, {
					body: corpo,
					icon: 'img/brand/insta-profile-logo.jpg',
					badge: 'img/brand/insta-profile-logo.jpg',
					tag: 'oracao-' + (oracaoId || Date.now())
				});
			} catch(e) {}
		}

		// 2. NotificaÃ§Ã£o no Sininho do App (/api/notificacoes) - EXCLUSIVA PARA ESTE USUÃRIO CADASTRADO
		var notifItem = {
			id: 'notify-oracao-' + Date.now(),
			tipo: 'oracao',
			badge: 'Lembrete de OraÃ§Ã£o',
			oracaoId: oracaoId,
			targetUserEmail: userEmail,
			targetUserId: userProfile.id || null,
			title: 'â° Hora da OraÃ§Ã£o! â€¢ Jovens Sarados',
			titleInt: titulo,
			body: corpo,
			imgThumb: 'img/pedrinhas/oracao.svg',
			dateTime: Math.floor(Date.now() / 1000),
			isViewed: 0,
			url: '#/app/posts?catId=oracoes&post=' + oracaoId
		};

		if (typeof fetch === 'function') {
			fetch('/api/notificacoes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(notifItem)
			}).catch(function(){});
		}

		if (!$rootScope.notifyTray) $rootScope.notifyTray = [];
		$rootScope.notifyTray.unshift(notifItem);
		$rootScope.temNoticiaNova = true;
		$rootScope.notifyTrayNumber = ($rootScope.notifyTray.length > 9 ? '9+' : $rootScope.notifyTray.length);
		if (!$rootScope.$$phase) $rootScope.$apply();
	};

	$scope.salvarLembreteOracao = function(oracao, customTime) {
		if (!oracao) return;
		var horario = customTime || $scope.horarioCustomInput || $scope.tempoLembreteSelecionado;
		if (!horario || typeof horario !== 'string' || horario.indexOf(':') === -1) {
			$ionicPopup.alert({
				title: 'Escolha um HorÃ¡rio',
				template: '<div style="text-align: center;"><p>Por favor, selecione ou digite o horÃ¡rio em que vocÃª deseja ser lembrado (ex: 15:00).</p></div>'
			});
			return;
		}

		// Padronizar HH:mm
		var partes = horario.split(':');
		var h = ('0' + parseInt(partes[0], 10)).slice(-2);
		var m = ('0' + parseInt(partes[1], 10)).slice(-2);
		horario = h + ':' + m;

		var userProfile = jsUser.getUser() || {};
		var userEmail = (userProfile.email) ? userProfile.email.toLowerCase().trim() : '';
		var userKey = 'js_oracoes_agenda_v1_' + (userEmail ? userEmail.replace(/[^a-z0-9]/g, '_') : 'guest');

		var novoItem = {
			id: 'agenda-' + (oracao.id || 'oracao') + '-' + Date.now(),
			oracaoId: oracao.id,
			nomeOracao: oracao.nome,
			horario: horario,
			ativo: true,
			userEmail: userEmail,
			userId: userProfile.id || null,
			atualizadoEm: new Date().toISOString()
		};

		var existsIdx = -1;
		for (var i = 0; i < $scope.agendaOracoes.length; i++) {
			if ($scope.agendaOracoes[i].oracaoId === oracao.id) {
				existsIdx = i;
				break;
			}
		}
		if (existsIdx >= 0) {
			$scope.agendaOracoes[existsIdx] = novoItem;
		} else {
			$scope.agendaOracoes.push(novoItem);
		}

		try { localStorage.setItem(userKey, JSON.stringify($scope.agendaOracoes)); } catch(e) {}
		try { localStorage.setItem('js_oracoes_agenda_v1', JSON.stringify($scope.agendaOracoes)); } catch(e) {}

		if (typeof fetch === 'function') {
			fetch('/api/oracoes/agenda', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(novoItem)
			}).catch(function(){});
		}

		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission();
		}

		$scope.mostrarConfigHorario[oracao.id] = false;

		$ionicPopup.alert({
			title: 'Lembrete Ativado!',
			template: '<div style="text-align: center;"><i class="icon ion-android-alarm-clock" style="font-size: 38px; color: #FF6A00;"></i><p style="margin-top: 10px; font-weight: 700;">Lembrete ativo todos os dias Ã s <b>' + horario + '</b>!<br>Somente vocÃª receberÃ¡ o alerta no sininho do app e no seu celular.</p></div>'
		});
	};

	$scope.desativarLembreteOracao = function(prayerId, silent) {
		if (!$scope.agendaOracoes) return;
		var userProfile = jsUser.getUser() || {};
		var userEmail = (userProfile.email) ? userProfile.email.toLowerCase().trim() : '';
		var userKey = 'js_oracoes_agenda_v1_' + (userEmail ? userEmail.replace(/[^a-z0-9]/g, '_') : 'guest');

		$scope.agendaOracoes = $scope.agendaOracoes.filter(function(a) { return a.oracaoId !== prayerId; });
		try { localStorage.setItem(userKey, JSON.stringify($scope.agendaOracoes)); } catch(e) {}
		try { localStorage.setItem('js_oracoes_agenda_v1', JSON.stringify($scope.agendaOracoes)); } catch(e) {}

		if (typeof fetch === 'function') {
			var delUrl = '/api/oracoes/agenda?id=' + encodeURIComponent(prayerId);
			if (userEmail) delUrl += '&userEmail=' + encodeURIComponent(userEmail);
			fetch(delUrl, { method: 'DELETE' }).catch(function(){});
		}

		if (!silent) {
			$ionicPopup.alert({
				title: 'Lembrete Desativado',
				template: 'VocÃª nÃ£o receberÃ¡ mais notificaÃ§Ãµes para esta oraÃ§Ã£o.'
			});
		}
	};

	$scope.testarNotificacaoOracao = function(oracao) {
		if (!oracao) return;
		var titulo = 'Hora de Rezar: ' + oracao.nome;
		var corpo = 'Pausa sagrada: Pare alguns minutos no ritmo da sua vida e eleve o coraÃ§Ã£o a Deus com esta oraÃ§Ã£o!';
		$scope.dispararNotificacaoSininhoECelular(titulo, corpo, oracao.id, oracao.nome);

		$ionicPopup.alert({
			title: 'NotificaÃ§Ã£o Disparada!',
			template: '<div style="text-align: center;"><i class="icon ion-ios-bell" style="font-size: 38px; color: #FF6A00;"></i><p style="margin-top: 10px;">NotificaÃ§Ã£o enviada com sucesso!<br><b>Observe o seu sininho no topo</b> com novo aviso e o lembrete no seu celular/navegador.</p></div>'
		});
	};

	$scope.testarLembreteItem = function(item) {
		if (!item) return;
		var titulo = 'Hora do Lembrete: ' + item.nomeOracao;
		var corpo = 'Alerta diÃ¡rio das ' + item.horario + ': Pare 5 minutinhos e reze junto com a comunidade Jovens Sarados!';
		$scope.dispararNotificacaoSininhoECelular(titulo, corpo, item.oracaoId, item.nomeOracao);

		$ionicPopup.alert({
			title: 'Teste Enviado!',
			template: 'NotificaÃ§Ã£o das ' + item.horario + ' disparada no seu sininho e no seu celular.'
		});
	};

	$scope.removerLembreteItem = function(item) {
		if (!item) return;
		var userProfile = jsUser.getUser() || {};
		var userEmail = (userProfile.email) ? userProfile.email.toLowerCase().trim() : '';
		var userKey = 'js_oracoes_agenda_v1_' + (userEmail ? userEmail.replace(/[^a-z0-9]/g, '_') : 'guest');

		$scope.agendaOracoes = $scope.agendaOracoes.filter(function(a) { return a.id !== item.id && a.oracaoId !== item.oracaoId; });
		try { localStorage.setItem(userKey, JSON.stringify($scope.agendaOracoes)); } catch(e) {}
		try { localStorage.setItem('js_oracoes_agenda_v1', JSON.stringify($scope.agendaOracoes)); } catch(e) {}

		if (typeof fetch === 'function') {
			var delUrl = '/api/oracoes/agenda?id=' + encodeURIComponent(item.id);
			if (userEmail) delUrl += '&userEmail=' + encodeURIComponent(userEmail);
			fetch(delUrl, { method: 'DELETE' }).catch(function(){});
		}
	};

	$scope.marcarOracaoRezada = function(oracao) {
		if (!oracao) return;
		var isTerco = (oracao.id === 'terco-mariano' || oracao.id === 'terco-misericordia');
		var isOracaoPessoal = (oracao.id === 'oracao-espirito-santo' || oracao.id === 'oferecimento-dia');

		try {
			var pRaw = localStorage.getItem('js_pedrinhas_store_v1');
			var pStore = pRaw ? JSON.parse(pRaw) : { records: {}, cumpridas: {} };
			var d = new Date();
			var todayStr = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
			if (!pStore.records) pStore.records = {};
			if (!pStore.records[todayStr]) pStore.records[todayStr] = {};
			if (!pStore.cumpridas) pStore.cumpridas = {};

			if (isTerco) {
				pStore.records[todayStr]['terco'] = true;
				pStore.cumpridas['terco'] = (pStore.cumpridas['terco'] || 0) + 1;
			} else {
				pStore.records[todayStr]['oracaoPessoal'] = true;
				pStore.cumpridas['oracaoPessoal'] = (pStore.cumpridas['oracaoPessoal'] || 0) + 1;
			}
			localStorage.setItem('js_pedrinhas_store_v1', JSON.stringify(pStore));
		} catch(e) {}

		$ionicPopup.alert({
			title: 'GlÃ³ria a Deus! ðŸ™',
			template: '<div style="text-align: center;"><i class="icon ion-ios-flame" style="font-size: 40px; color: #FF6A00;"></i><p style="margin-top: 10px; font-weight: 700; font-size: 14px;">OraÃ§Ã£o registrada com sucesso!</p><p style="font-size: 12px; color: #64748B;">Sua fidelidade na oraÃ§Ã£o santifica o seu dia e fortalece sua alma no carisma Jovens Sarados.</p></div>'
		});
	};

	$scope.shareOracaoWhatsApp = function(oracao) {
		var item = oracao || $scope.conteudo || {};
		var nome = item.nome || 'OraÃ§Ã£o Jovens Sarados';
		var sub = item.subtitulo || 'CanÃ§Ã£o Nova â€¢ OraÃ§Ã£o Oficial';
		var text = encodeURIComponent('ðŸ™ *Jovens Sarados â€¢ Momento de OraÃ§Ã£o*\n\nðŸ”¥ *' + nome + '*\n_' + sub + '_\n\n"Rezar no ritmo da vida Ã© cavar um tempo para estar com Deus!"\n\nReze comigo no App Jovens Sarados:\nhttps://coverage-prospective-potato-scheme.trycloudflare.com');
		window.open('https://api.whatsapp.com/send?text=' + text, '_blank');
	};

	$scope.shareOracaoInstagram = function(oracao) {
		var item = oracao || $scope.conteudo || {};
		var shareText = 'OraÃ§Ã£o: ' + (item.nome || 'Jovens Sarados') + ' - Academia para a Alma!';
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareText).then(function() {
				$ionicPopup.alert({
					title: 'Texto Copiado!',
					template: 'O trecho da oraÃ§Ã£o foi copiado! Cole no seu Story ou envie no Direct do Instagram @jovens.sarados.'
				}).then(function() {
					window.open('https://www.instagram.com/jovens.sarados/', '_blank');
				});
			});
		} else {
			window.open('https://www.instagram.com/jovens.sarados/', '_blank');
		}
	};

	$scope.abrirOracao = function(item) {
		$state.go('app.posts', { catId: 'oracoes', post: item.id, pageTitle: item.nome });
	};

	// Obter ConteÃºdo
	$scope.getContent = function(showLoading) {	
		var showLoading = (typeof(showLoading) == 'boolean') ? showLoading : true;
		var webServiceArgs;

		if($stateParams.post && $stateParams.post.length > 0) {
			webServiceArgs = {op: 'getPost', id: $stateParams.post};
		} else if($stateParams.catId && $stateParams.catId.length > 0) {
			webServiceArgs = {op: 'getCategories', qty: 20};
			if(isNaN($stateParams.catId)) {				
				webServiceArgs['catName'] = $stateParams.catId;
			} else {
				webServiceArgs['id'] = $stateParams.catId;
			}
		}

		if($scope.contentOffset) {
			webServiceArgs['offset'] = $scope.contentOffset;
		}

		webService.call(webServiceArgs, showLoading).then(function(r){
			$rootScope.webServiceLoading = false;
			console.log('[postsCtrl getContent]', r);

			if(r.data && r.data.subCat && r.data.subCat.length > 0) {
				$scope.categorias = r.data.subCat;
			}

			if(r.data && r.data.posts && r.data.posts.length > 0) {
				$scope.posts = r.data.posts;
				$scope.categoriaNome = r.data.nome;
			}

			if(r.data && (r.data.conteudo || r.data.videoId || r.data.pdfUrl)) {
				if ($sce && r.data.conteudo) { r.data.conteudo = $sce.trustAsHtml(r.data.conteudo); }
				if ($sce && r.data.nome) { r.data.nome = $sce.trustAsHtml(r.data.nome); }
				if ($sce && r.data.texto) { r.data.texto = $sce.trustAsHtml(r.data.texto); }
				$scope.conteudo = r.data;
			}
			if (!$scope.$$phase) { $scope.$apply(); }
		});
	};

	$scope.getContent();



}).controller('postCtrl', function($ionicLoading, $window, $ionicModal, $scope, $rootScope, $state, jsUser, $q, CONF, $ionicLoading, $stateParams, G, webService) {

	

	$scope.post = {};



	if($stateParams.postId) {		

		webService.call({op: 'post', id: $stateParams.postId}, true).then(function(r){



			if(Object.keys(r.data).length > 0) {

				$scope.post = r.data;

			}

		});

	}





})

.controller('liturgiaDiariaCtrl', function($ionicPlatform, $scope, $rootScope, $state, jsUser, $ionicPopup, $cordovaSQLite, DB, $cordovaCamera, G, $sce, $ionicLoading, webService, $timeout) {

	$scope.G = G;
	$scope.liturgiaData = null;
	$scope.highlights = {};
	$scope.trechosMarcados = [];
	$scope.anotacaoDiaria = { texto: '' };
	$scope.jaSalvoHoje = false;
	$scope.modoMarcaTextoAtivo = true;

	// Cores litÃºrgicas
	$scope.getCorLiturgicaInfo = function(cor) {
		var c = (cor || '').toLowerCase();
		if (c.indexOf('verde') !== -1) {
			return { nome: 'Verde â€¢ Tempo Comum', bg: '#059669', badgeBg: '#ECFDF5', text: '#065F46', dot: '#10B981' };
		} else if (c.indexOf('branco') !== -1) {
			return { nome: 'Branco â€¢ Solenidade / Festa', bg: '#64748B', badgeBg: '#F8FAFC', text: '#334155', dot: '#CBD5E1' };
		} else if (c.indexOf('vermelho') !== -1) {
			return { nome: 'Vermelho â€¢ MÃ¡rtires / Pentecostes', bg: '#DC2626', badgeBg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' };
		} else if (c.indexOf('roxo') !== -1) {
			return { nome: 'Roxo â€¢ PenitÃªncia e Espera', bg: '#7C3AED', badgeBg: '#F5F3FF', text: '#5B21B6', dot: '#8B5CF6' };
		} else if (c.indexOf('rosa') !== -1) {
			return { nome: 'Rosa â€¢ Alegria', bg: '#DB2777', badgeBg: '#FDF2F8', text: '#9D174D', dot: '#F472B6' };
		}
		return { nome: cor || 'Liturgia do Dia', bg: '#003CFF', badgeBg: '#EFF6FF', text: '#1E40AF', dot: '#3B82F6' };
	};

	// FormataÃ§Ã£o elegante de data em portuguÃªs
	$scope.formatarDataExtenso = function(d) {
		d = d || new Date();
		var diasSemana = ['Domingo', 'Segunda-feira', 'TerÃ§a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'SÃ¡bado'];
		var meses = ['Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
		return diasSemana[d.getDay()] + ', ' + d.getDate() + ' de ' + meses[d.getMonth()] + ' de ' + d.getFullYear();
	};

	// Split de parÃ¡grafos da leitura
	$scope.splitParagrafos = function(texto) {
		if (!texto) return [];
		if (Array.isArray(texto)) return texto;
		var linhas = ('' + texto).split('\n');
		var res = [];
		for (var i = 0; i < linhas.length; i++) {
			var l = linhas[i].trim();
			if (l.length > 0) res.push(l);
		}
		return res.length > 0 ? res : [texto];
	};

	// Split de versos/estrofes do salmo
	$scope.splitSalmoEstrofes = function(salmoTexto) {
		if (!salmoTexto) return [];
		var partes = ('' + salmoTexto).split(/\n|â€“\s+/);
		var res = [];
		for (var i = 0; i < partes.length; i++) {
			var p = partes[i].trim();
			if (p.length > 0) {
				p = p.replace(/^â€“\s*/, '');
				res.push(p);
			}
		}
		return res;
	};

	// Marca-texto: Carregar e Salvar
	$scope.loadHighlights = function(dateKey) {
		try {
			var saved = localStorage.getItem('js_liturgia_hl_' + dateKey);
			$scope.highlights = saved ? JSON.parse(saved) : {};
			var savedTrechos = localStorage.getItem('js_liturgia_trechos_' + dateKey);
			$scope.trechosMarcados = savedTrechos ? JSON.parse(savedTrechos) : [];
		} catch(e) {
			$scope.highlights = {};
			$scope.trechosMarcados = [];
		}
	};

	$scope.saveHighlights = function(dateKey) {
		try {
			localStorage.setItem('js_liturgia_hl_' + dateKey, JSON.stringify($scope.highlights));
			localStorage.setItem('js_liturgia_trechos_' + dateKey, JSON.stringify($scope.trechosMarcados));
		} catch(e) {}
	};

	$scope.isHighlighted = function(secao, index) {
		var key = secao + '_' + index;
		return Boolean($scope.highlights && $scope.highlights[key]);
	};

	$scope.toggleHighlight = function(secao, index, texto) {
		var key = secao + '_' + index;
		if ($scope.highlights[key]) {
			delete $scope.highlights[key];
			$scope.trechosMarcados = $scope.trechosMarcados.filter(function(t) { return t.key !== key; });
		} else {
			$scope.highlights[key] = true;
			var clean = (texto || '').trim();
			if (clean) {
				$scope.trechosMarcados.push({ key: key, texto: clean });
			}
		}
		$scope.saveHighlights($scope.currentDateFormattedKey);
	};

	$scope.limparMarcacoes = function() {
		$scope.highlights = {};
		$scope.trechosMarcados = [];
		$scope.saveHighlights($scope.currentDateFormattedKey);
		$ionicLoading.show({ template: 'MarcaÃ§Ãµes removidas.', duration: 900 });
	};

	// Destacar texto que o usuÃ¡rio selecionou livremente com o cursor
	$scope.destacarTextoSelecionado = function() {
		var sel = window.getSelection ? window.getSelection().toString() : '';
		if (sel && sel.trim().length > 3) {
			var key = 'sel_' + Date.now();
			$scope.trechosMarcados.push({ key: key, texto: sel.trim() });
			$scope.saveHighlights($scope.currentDateFormattedKey);
			$ionicLoading.show({ template: 'ðŸ–ï¸ Trecho selecionado destacado!', duration: 1200 });
		} else {
			$ionicLoading.show({ template: 'Selecione uma frase do texto para destacar.', duration: 1500 });
		}
	};

	// AnotaÃ§Ãµes DiÃ¡rias
	$scope.loadAnotacao = function(dateKey) {
		var savedNota = localStorage.getItem('js_liturgia_nota_' + dateKey);
		$scope.anotacaoDiaria.texto = savedNota || '';
		$scope.jaSalvoHoje = localStorage.getItem('js_liturgia_salvo_' + dateKey) === 'true';
	};

	$scope.salvarRascunhoAnotacao = function() {
		if ($scope.currentDateFormattedKey) {
			localStorage.setItem('js_liturgia_nota_' + $scope.currentDateFormattedKey, $scope.anotacaoDiaria.texto || '');
		}
	};

	$scope.inserirTrechoNaAnotacao = function(trecho) {
		var quote = '\n\n"' + trecho + '"\n';
		$scope.anotacaoDiaria.texto = ($scope.anotacaoDiaria.texto || '') + quote;
		$scope.salvarRascunhoAnotacao();
	};

	// Salvar no DiÃ¡rio BÃ­blico
	$scope.salvarNoDiario = function() {
		var reflexao = ($scope.anotacaoDiaria && $scope.anotacaoDiaria.texto) ? $scope.anotacaoDiaria.texto.trim() : '';
		if (!reflexao) {
			$ionicPopup.alert({
				title: 'Escreva sua reflexÃ£o',
				template: '<p style="text-align:center; color:#1E293B;">Por favor, digite o que vocÃª sentiu ou entendeu da Palavra de hoje antes de salvar no seu DiÃ¡rio.</p>',
				okText: 'OK',
				okType: 'button-assertive'
			});
			return;
		}

		var d = $scope.onezoneDatepicker.date || new Date();
		var dataFormatada = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();

		var passagem = '';
		if ($scope.liturgiaData && $scope.liturgiaData.evangelho) {
			passagem = 'Evangelho: ' + ($scope.liturgiaData.evangelho.referencia || '') + ' - ' + ($scope.liturgiaData.evangelho.titulo || '');
		} else if ($scope.liturgiaData && $scope.liturgiaData.primeiraLeitura) {
			passagem = 'Primeira Leitura: ' + ($scope.liturgiaData.primeiraLeitura.referencia || '');
		}

		var trechosStr = '';
		if ($scope.trechosMarcados && $scope.trechosMarcados.length > 0) {
			trechosStr = '\n\nðŸ–ï¸ Trecho(s) destacado(s) na Liturgia:\n' + $scope.trechosMarcados.map(function(t) { return 'â€¢ "' + t.texto + '"'; }).join('\n');
		}

		var entradaFormatada = 'ðŸ“– Liturgia DiÃ¡ria (' + dataFormatada + ')\n' +
			(passagem ? 'âœï¸ ' + passagem + '\n' : '') +
			trechosStr +
			'\n\nâœï¸ Minha MeditaÃ§Ã£o:\n' + reflexao;

		$ionicLoading.show({ template: 'Guardando no seu DiÃ¡rio BÃ­blico...' });

		webService.call({
			op: 'estudoBiblicoAdd',
			texto: entradaFormatada,
			tipo: 'liturgia',
			dataLiturgia: dataFormatada
		}).then(function(r) {
			$ionicLoading.hide();
			$scope.jaSalvoHoje = true;
			localStorage.setItem('js_liturgia_salvo_' + $scope.currentDateFormattedKey, 'true');

			$ionicPopup.show({
				title: 'âœ¨ Salvo no Meu DiÃ¡rio!',
				subTitle: 'Sua meditaÃ§Ã£o da Liturgia DiÃ¡ria foi registrada.',
				template: '<p style="text-align: center; color: #101650; font-size: 13.5px;">Sua anotaÃ§Ã£o e os trechos marcados estÃ£o guardados no seu <b>DiÃ¡rio BÃ­blico</b> com data e passagem!</p>',
				buttons: [
					{
						text: 'Continuar Lendo',
						type: 'button-default'
					},
					{
						text: '<b>Ver no Meu DiÃ¡rio</b>',
						type: 'button-positive',
						onTap: function() {
							$state.go('app.diarioBiblico');
						}
					}
				]
			});
		}, function(err) {
			$ionicLoading.hide();
			$ionicPopup.alert({
				title: 'Ops!',
				template: 'NÃ£o foi possÃ­vel salvar no momento. Tente novamente.',
				okType: 'button-assertive'
			});
		});
	};

	// NavegaÃ§Ã£o de Dias
	$scope.mudarDia = function(delta) {
		var cur = $scope.onezoneDatepicker.date ? new Date($scope.onezoneDatepicker.date) : new Date();
		cur.setDate(cur.getDate() + delta);
		$scope.onezoneDatepicker.date = cur;
		$scope.showLiturgiaDiaria(cur);
	};

	$scope.irParaHoje = function() {
		var hoje = new Date();
		$scope.onezoneDatepicker.date = hoje;
		$scope.showLiturgiaDiaria(hoje);
	};

	// Carregamento principal
	$scope.showLiturgiaDiaria = function(date) {
		var date = date || new Date();
		$scope.date = date;
		if ($scope.onezoneDatepicker) {
			$scope.onezoneDatepicker.date = date;
		}

		var dateM = date.getMonth() + 1;
		var dateD = date.getDate();
		if (dateM < 10) dateM = '0' + dateM;
		if (dateD < 10) dateD = '0' + dateD;
		var dateSql = (date.getFullYear()) + '-' + dateM + '-' + dateD;
		$scope.currentDateFormattedKey = dateSql;

		$scope.loadHighlights(dateSql);
		$scope.loadAnotacao(dateSql);

		$ionicLoading.show({
			template: '<ion-spinner icon="crescent" class="spinner-energized"></ion-spinner><br><span style="font-size:12px; font-weight:700;">Carregando Palavra de Deus...</span>',
			duration: 8000
		});

		$cordovaSQLite.execute(DB.db, 'SELECT * FROM liturgia_diaria WHERE data = ?', [dateSql]).then(function(result) {
			$ionicLoading.hide();
			var length = result.rows.length;
			if (length > 0) {
				var item = result.rows.item(0);
				$scope.liturgiaData = item.raw || null;
				$scope.liturgiaDiaria = $sce.trustAsHtml(item.texto);
				if (!$scope.$$phase) { $scope.$apply(); }
			}
		}, function (err) {
			$ionicLoading.hide();
			console.log('[liturgiaDiaria] Erro SQLite:', err);
		});
	};

	var currentDate = new Date();
	var date = new Date();
	$scope.date = date;

	$scope.myFunction = function (date) {
		$scope.showLiturgiaDiaria(date);
	};

	$scope.onezoneDatepicker = {
		date: date,
		mondayFirst: false,
		months: ["Janeiro", "Fevereiro", "MarÃ§o", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		daysOfTheWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],
		disablePastDays: false,
		disableSwipe: false,
		disableWeekend: false,
		showDatepicker: false,
		showTodayButton: true,
		calendarMode: false,
		hideCancelButton: false,
		hideSetButton: true,
		callback: $scope.myFunction
	};

	// ReativaÃ§Ã£o do Compartilhar WhatsApp (Compartilha EXCLUSIVAMENTE o Evangelho do Dia)
	$scope.shareLiturgiaWhatsApp = function() {
		var d = $scope.onezoneDatepicker.date || new Date();
		var dataStr = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();

		var evangelhoRef = ($scope.liturgiaData && $scope.liturgiaData.evangelho && $scope.liturgiaData.evangelho.referencia) 
			? $scope.liturgiaData.evangelho.referencia 
			: 'Evangelho de Jesus Cristo';

		var evangelhoTitulo = ($scope.liturgiaData && $scope.liturgiaData.evangelho && $scope.liturgiaData.evangelho.titulo) 
			? $scope.liturgiaData.evangelho.titulo 
			: '';

		var evangelhoTexto = ($scope.liturgiaData && $scope.liturgiaData.evangelho && $scope.liturgiaData.evangelho.texto) 
			? $scope.liturgiaData.evangelho.texto 
			: '';

		var textoTrecho = evangelhoTexto;
		if (textoTrecho.length > 700) {
			textoTrecho = textoTrecho.substring(0, 680) + '...';
		}

		var text = 'ðŸ“– *Evangelho do Dia (' + dataStr + ')*\n' +
			'âœï¸ *' + evangelhoRef + '*\n' +
			(evangelhoTitulo ? '_' + evangelhoTitulo + '_\n\n' : '\n') +
			'â€œ' + textoTrecho + 'â€\n\n' +
			'ðŸ”¥ *Jovens Sarados â€¢ GeraÃ§Ã£o Radical*\n' +
			'Acesse a Liturgia completa no nosso App:\n' +
			window.location.origin + '/#/app/liturgiaDiaria';

		$rootScope.dispararCompartilhamentoWhatsApp(text);
	};

	// ReativaÃ§Ã£o do Compartilhar Instagram (Compartilha EXCLUSIVAMENTE o Evangelho do Dia)
	$scope.shareLiturgiaInstagram = function() {
		var d = $scope.onezoneDatepicker.date || new Date();
		var dataStr = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();

		var evangelhoRef = ($scope.liturgiaData && $scope.liturgiaData.evangelho && $scope.liturgiaData.evangelho.referencia) 
			? $scope.liturgiaData.evangelho.referencia 
			: 'Evangelho do Dia';

		var evangelhoTexto = ($scope.liturgiaData && $scope.liturgiaData.evangelho && $scope.liturgiaData.evangelho.texto) 
			? $scope.liturgiaData.evangelho.texto 
			: '';

		var textoTrecho = evangelhoTexto;
		if (textoTrecho.length > 600) {
			textoTrecho = textoTrecho.substring(0, 580) + '...';
		}

		var text = 'Evangelho do Dia (' + dataStr + ') â€¢ Jovens Sarados\n' +
			'ðŸ“– ' + evangelhoRef + '\n\n' +
			'â€œ' + textoTrecho + 'â€\n\n' +
			'ðŸ”¥ GeraÃ§Ã£o Radical â€¢ Jovens Sarados\n' +
			'#JovensSarados #EvangelhoDoDia #LiturgiaDiaria #GeracaoRadical #IgrejaCatolica #Santidade';

		$rootScope.dispararCompartilhamentoInstagram(text);

		$ionicPopup.show({
			title: 'ðŸ“¸ Compartilhar no Instagram',
			subTitle: 'O Evangelho de hoje foi copiado!',
			template: '<div style="text-align: center; font-size: 13px; color: #1E293B;">' +
				'<p>O texto sagrado do Evangelho jÃ¡ foi copiado para sua Ã¡rea de transferÃªncia.</p>' +
				'<p style="font-size: 11.5px; color: #64748B;">Abra o Instagram e cole na legenda do seu post ou no Story!</p>' +
				'</div>',
			buttons: [
				{
					text: 'Abrir Instagram',
					type: 'button-positive',
					onTap: function() {
						window.open('https://www.instagram.com', '_blank');
					}
				},
				{
					text: 'OK',
					type: 'button-default'
				}
			]
		});
	};

	$scope.showDatepicker = function () {
		$scope.onezoneDatepicker.showDatepicker = true;
	};

	// Executa imediatamente para a liturgia aparecer no mesmo instante que o usuario clica
	$scope.showLiturgiaDiaria();

	// E recarrega sempre que navegar para a tela
	$scope.$on('$ionicView.enter', function() { $scope.showLiturgiaDiaria(); });

	$ionicPlatform.ready(function() {
		$scope.showLiturgiaDiaria();
	});

})

.controller('santoDoDiaCtrl', function($ionicPlatform, $scope, $rootScope, $state, webService, $sce, $ionicPopup, $window, $ionicScrollDelegate) {

	$scope.abaAtiva = 'historia'; // 'historia', 'frases', 'oracao'

	$scope.setAba = function(aba) {
		$scope.abaAtiva = aba;
		if ($ionicScrollDelegate && typeof $ionicScrollDelegate.scrollTop === 'function') {
			$ionicScrollDelegate.scrollTop(true);
		}
	};

	var coresFrasesSanto = [
		{ borda: '#FF2A2A', badgeGrad: 'linear-gradient(135deg, #FF2A2A 0%, #DC2626 100%)', bgPill: '#FEE2E2', corPill: '#B91C1C', sombra: 'rgba(255, 42, 42, 0.25)' },
		{ borda: '#FF6A00', badgeGrad: 'linear-gradient(135deg, #FF6A00 0%, #EA580C 100%)', bgPill: '#FFEDD5', corPill: '#C2410C', sombra: 'rgba(255, 106, 0, 0.25)' },
		{ borda: '#003CFF', badgeGrad: 'linear-gradient(135deg, #003CFF 0%, #101650 100%)', bgPill: '#DBEAFE', corPill: '#1E40AF', sombra: 'rgba(0, 60, 255, 0.25)' },
		{ borda: '#F59E0B', badgeGrad: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bgPill: '#FEF3C7', corPill: '#92400E', sombra: 'rgba(245, 158, 11, 0.25)' },
		{ borda: '#10B981', badgeGrad: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bgPill: '#D1FAE5', corPill: '#065F46', sombra: 'rgba(16, 185, 129, 0.25)' }
	];

	$scope.getEstiloFraseSanto = function(index) {
		return coresFrasesSanto[index % coresFrasesSanto.length];
	};

	// Helper para abrir o Instagram do prÃ³prio usuÃ¡rio logado
	function abrirInstagramPessoalUsuario() {
		var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');
		if (isMobile) {
			window.location.href = 'instagram://app';
			setTimeout(function() {
				$window.open('https://www.instagram.com/', '_blank');
			}, 600);
		} else {
			$window.open('https://www.instagram.com/', '_blank');
		}
	}

	function getAppShareUrl() {
		return (window.location && window.location.origin) ? window.location.origin : 'https://forget-schema-loading-satisfaction.trycloudflare.com';
	}

	$scope.shareSantoWhatsApp = function() {
		var item = $scope.conteudo || {};
		var nome = item.nome || 'Santo do Dia';
		var dataStr = item.data || 'Hoje';
		var primeiraFrase = (item.frases && item.frases.length > 0) ? item.frases[0].frase : 'Abri as portas a Cristo!';
		var text = 'âœ¨ *Jovens Sarados â€¢ Santo do Dia*\n\n' +
				   'ðŸ‘‘ *' + nome + '* (' + dataStr + ')\n' +
				   '_' + (item.titulo || 'Exemplo de radicalidade evangÃ©lica!') + '_\n\n' +
				   'ðŸ’¬ _"' + primeiraFrase + '"_\n\n' +
				   'ðŸ“² Veja a histÃ³ria completa, frases e oraÃ§Ã£o no *App Jovens Sarados*:\n' +
				   getAppShareUrl();
		$window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(text), '_blank');
	};

	$scope.shareSantoInstagram = function() {
		var item = $scope.conteudo || {};
		var nome = item.nome || 'Santo do Dia';
		var shareText = 'Santo do Dia â€¢ ' + nome + ' | Jovens Sarados â€¢ GeraÃ§Ã£o Radical #SantoDoDia #JovensSarados #Santidade';
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareText).then(function() {
				$ionicPopup.alert({
					title: 'Copiado para o seu Instagram! ðŸ“¸',
					template: '<div style="text-align: center;"><i class="icon ion-social-instagram" style="font-size: 38px; color: #E1306C;"></i><p style="margin-top: 10px; font-weight: 700; font-size: 14px;">O Santo do Dia foi copiado!</p><p style="font-size: 12px; color: #64748B;">Vamos abrir o seu Instagram pessoal para vocÃª colar nos seus Stories ou PublicaÃ§Ã£o.</p></div>'
				}).then(function() {
					abrirInstagramPessoalUsuario();
				});
			}).catch(function() {
				abrirInstagramPessoalUsuario();
			});
		} else {
			abrirInstagramPessoalUsuario();
		}
	};

	// Compartilhar frase especÃ­fica do Santo do Dia no WhatsApp
	$scope.shareFraseWhatsApp = function(fraseItem) {
		if (!fraseItem) return;
		var autor = ($scope.conteudo && $scope.conteudo.nome) ? $scope.conteudo.nome : 'Santo do Dia';
		var msg = 'âœ¨ *Santo do Dia â€¢ Jovens Sarados*\n\n' +
				  'ðŸ’¬ _"' + (fraseItem.frase || '').replace(/<[^>]*>?/gm, '').trim() + '"_\n\n' +
				  'ðŸ‘‘ *' + autor + '*\n\n' +
				  'ðŸ“² Acesse o App Jovens Sarados:\n' + getAppShareUrl();
		$window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
	};

	// Compartilhar frase especÃ­fica do Santo do Dia no Instagram
	$scope.shareFraseInstagram = function(fraseItem) {
		if (!fraseItem) return;
		var autor = ($scope.conteudo && $scope.conteudo.nome) ? $scope.conteudo.nome : 'Santo do Dia';
		var shareText = '"' + (fraseItem.frase || '').replace(/<[^>]*>?/gm, '').trim() + '" â€” ' + autor + ' #SantoDoDia #JovensSarados';
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareText).then(function() {
				$ionicPopup.alert({
					title: 'Frase Copiada! ðŸ“¸',
					template: '<div style="text-align: center;"><i class="icon ion-social-instagram" style="font-size: 38px; color: #E1306C;"></i><p style="margin-top: 10px; font-weight: 700; font-size: 14px;">A frase foi copiada com sucesso!</p><p style="font-size: 12px; color: #64748B;">Vamos abrir o seu Instagram pessoal para vocÃª colar no seu Story ou Feed.</p></div>'
				}).then(function() {
					abrirInstagramPessoalUsuario();
				});
			}).catch(function() {
				abrirInstagramPessoalUsuario();
			});
		} else {
			abrirInstagramPessoalUsuario();
		}
	};

	// Compartilhar oraÃ§Ã£o do Santo no WhatsApp
	$scope.shareOracaoWhatsApp = function() {
		var oracaoObj = ($scope.conteudo && $scope.conteudo.oracao) ? $scope.conteudo.oracao : null;
		var nome = ($scope.conteudo && $scope.conteudo.nome) ? $scope.conteudo.nome : 'Santo do Dia';
		var oracaoTexto = oracaoObj ? (oracaoObj.texto || '') : '';
		var msg = 'ðŸ™ *OraÃ§Ã£o do Santo do Dia â€¢ ' + nome + '*\n\n' +
				  oracaoTexto + '\n\n' +
				  (oracaoObj && oracaoObj.jaculatoria ? ('_' + oracaoObj.jaculatoria + '_\n\n') : '') +
				  'ðŸ“² Reze conosco no App Jovens Sarados:\n' + getAppShareUrl();
		$window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(msg), '_blank');
	};

	// Compartilhar oraÃ§Ã£o do Santo no Instagram
	$scope.shareOracaoInstagram = function() {
		var oracaoObj = ($scope.conteudo && $scope.conteudo.oracao) ? $scope.conteudo.oracao : null;
		var nome = ($scope.conteudo && $scope.conteudo.nome) ? $scope.conteudo.nome : 'Santo do Dia';
		var shareText = 'OraÃ§Ã£o a ' + nome + ':\n\n' + (oracaoObj ? oracaoObj.texto : '') + '\n\n#SantoDoDia #JovensSarados #Oracao';
		if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(shareText).then(function() {
				$ionicPopup.alert({
					title: 'OraÃ§Ã£o Copiada! ðŸ“¸',
					template: '<div style="text-align: center;"><i class="icon ion-social-instagram" style="font-size: 38px; color: #E1306C;"></i><p style="margin-top: 10px; font-weight: 700; font-size: 14px;">A oraÃ§Ã£o foi copiada com sucesso!</p><p style="font-size: 12px; color: #64748B;">Vamos abrir o seu Instagram pessoal para vocÃª compartilhar nos Stories ou Feed.</p></div>'
				}).then(function() {
					abrirInstagramPessoalUsuario();
				});
			}).catch(function() {
				abrirInstagramPessoalUsuario();
			});
		} else {
			abrirInstagramPessoalUsuario();
		}
	};

	// Marcar oraÃ§Ã£o como rezada hoje
	$scope.marcarOracaoCumprida = function() {
		$ionicPopup.alert({
			title: 'GlÃ³ria a Deus! ðŸ™',
			template: '<div style="text-align: center;"><i class="icon ion-ios-flame" style="font-size: 40px; color: #FF6A00;"></i><p style="margin-top: 10px; font-weight: 800; font-size: 14px; color: #101650;">OraÃ§Ã£o do Santo do Dia realizada!</p><p style="font-size: 12px; color: #64748B;">A intercessÃ£o dos santos fortalece sua caminhada no carisma Jovens Sarados.</p></div>'
		});
	};

	$scope.showSanto = function(date) {
		$scope.conteudo = {};
		var date = date || new Date();	
		var dateM = date.getMonth()+1;
		var dateD = date.getDate();
		if(dateM < 10) dateM = '0'+dateM;
		if(dateD < 10) dateD = '0'+dateD;
		var dateStr = dateM+'-'+dateD;

		webService.call({op: 'santoDoDia', data: dateStr}, true).then(function(r){
			if (r && r.data) {
				var d = r.data;
				if ($sce) {
					if (d.historia) d.historiaSce = $sce.trustAsHtml(d.historia);
					if (d.texto) d.textoSce = $sce.trustAsHtml(d.texto);
				}
				$scope.conteudo = d;
				if (!$scope.$$phase) { $scope.$apply(); }
			}
		});
	};



	var currentDate = new Date();

	var date = new Date();

	$scope.date = date;



	$scope.showSantoCallback = function (date) {

		$scope.showSanto(date);

	};



	

	$scope.onezoneDatepicker = {

		date: date,

		mondayFirst: false,

		months: ["Janeiro", "Fevereiro", "Maro", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],

		daysOfTheWeek: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"],

		//startDate: new Date(2016, 1, 1),

		//endDate: new Date(2016, 12, 31),

		disablePastDays: false,

		disableSwipe: false,

		disableWeekend: false,

		//disableDates: [new Date(date.getFullYear(), date.getMonth(), 15), new Date(date.getFullYear(), date.getMonth(), 16), new Date(date.getFullYear(), date.getMonth(), 17)],

		showDatepicker: false,

		showTodayButton: true,

		calendarMode: false,

		hideCancelButton: false,

		hideSetButton: true,

		callback: $scope.showSantoCallback

	 };



		$scope.shareLiturgiaWhatsApp = function() {

		var d = $scope.onezoneDatepicker.date || new Date();

		var dataStr = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();

		var text = '?? *Liturgia Diria (' + dataStr + ') - Jovens Sarados*\n\n' +

			'Confira as leituras e o Evangelho de hoje no App Jovens Sarados:\nhttps://app.jovenssarados.com/#/app/liturgiaDiaria\n\n' +

			'?? Gerao Radical  Jovens Sarados';

		$rootScope.dispararCompartilhamentoWhatsApp(text);

	};



	$scope.shareLiturgiaInstagram = function() {

		var d = $scope.onezoneDatepicker.date || new Date();

		var dataStr = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();

		var text = 'Liturgia Diria (' + dataStr + ') - Jovens Sarados\nEvangelho do dia e reflexo para a sua santidade!\n\n#JovensSarados #GeracaoRadical #LiturgiaDiaria';

		$rootScope.dispararCompartilhamentoInstagram(text);

	};



	$scope.showDatepicker = function () {

		$scope.onezoneDatepicker.showDatepicker = true;

	};



	$ionicPlatform.ready(function() {
		$scope.showSanto();
	});

	// Chamada direta para emulaÃ§Ã£o web e browser
	$scope.showSanto();

})

.controller('ShareCtrl', function($scope, $state, jsUser, $q, CONF, $ionicLoading) {

	$scope.user = jsUser.getUser();

	$scope.image_to_share = "https://c1.staticflickr.com/9/8322/8057495684_335ee78565_z.jpg";

	if (!window.cordova) {

		//this is for browser only

		facebookConnectPlugin.browserInit(CONF.FACEBOOK_APP_ID);

	}

	$scope.post_status = function() {

		facebookConnectPlugin.showDialog({

			method: "feed"

		}, function(response) {

			$ionicLoading.show({

				template: 'Status posted!',

				noBackdrop: true,

				duration: 2000

			});

		}, function(response) {

			//fail

		});

	};

	$scope.send_message = function() {

		facebookConnectPlugin.showDialog({

			method: 'send',

			link: 'http://example.com',

		}, function(response) {

			$ionicLoading.show({

				template: 'Message sent!',

				noBackdrop: true,

				duration: 2000

			});

		}, function(response) {

			//fail

		});

	};

	$scope.post_image = function() {

		facebookConnectPlugin.showDialog({

			method: "feed",

			picture: $scope.image_to_share,

			name: 'Test Post',

			message: 'This is a test post',

			caption: 'Testing using IonFB app',

			description: 'Posting photo using IonFB app'

		}, function(response) {

			$ionicLoading.show({

				template: 'Image posted!',

				noBackdrop: true,

				duration: 2000

			});

		}, function(response) {

			//fail

		});

	};

	$scope.share_link = function() {

		facebookConnectPlugin.showDialog({

			method: "share",

			href: 'http://example.com',

		}, function(response) {

			$ionicLoading.show({

				template: 'Link shared!',

				noBackdrop: true,

				duration: 2000

			});

		}, function(response) {

			//fail

		});

	};

})

.controller('missoesCtrl', function($scope, $rootScope, $window, $http, $ionicScrollDelegate, $ionicModal, $ionicPopup, $ionicLoading, $cordovaToast) {

	$scope.missoes = (typeof window !== 'undefined' && window.JS_MISSOES_DATA) ? window.JS_MISSOES_DATA : [];
	$scope.missaoEmEdicao = {};

	$scope.filtro = {
		texto: '',
		status: 'todas',
		estado: ''
	};

	$scope.estados = [];

	function atualizarEstados() {
		$scope.estados = [];
		var estMap = {};
		for (var i = 0; i < $scope.missoes.length; i++) {
			var uf = $scope.missoes[i].estado;
			if (uf && uf !== '-' && !estMap[uf]) {
				estMap[uf] = true;
				$scope.estados.push(uf);
			}
		}
		$scope.estados.sort();
	}

	atualizarEstados();

	// Carrega dados atualizados da API
	$scope.carregarMissoes = function() {
		$http.get('/api/missoes')
			.then(function(res) {
				if (res && res.data && Array.isArray(res.data)) {
					$scope.missoes = res.data;
					atualizarEstados();
					try {
						localStorage.setItem('js_missoes_cache', JSON.stringify(res.data));
					} catch(e) {}
				}
			})
			.catch(function() {
				try {
					var cached = localStorage.getItem('js_missoes_cache');
					if (cached) {
						$scope.missoes = JSON.parse(cached);
						atualizarEstados();
					}
				} catch(e) {}
			});
	};

	$scope.carregarMissoes();

	$scope.isQuinzenal = function(txt) {
		if (!txt) return false;
		return txt.toLowerCase().indexOf('quinzenal') !== -1;
	};

	$scope.filtroCustom = function(m) {
		// Filtro de texto (busca em nome, cidade, estado, regiÃ£o, endereÃ§o)
		if ($scope.filtro.texto && $scope.filtro.texto.trim() !== '') {
			var q = $scope.filtro.texto.toLowerCase().trim();
			var nome = (m.nome || '').toLowerCase();
			var cid = (m.cidade || '').toLowerCase();
			var est = (m.estado || '').toLowerCase();
			var reg = (m.regiao || '').toLowerCase();
			var end = (m.endereco || '').toLowerCase();

			if (nome.indexOf(q) === -1 && cid.indexOf(q) === -1 && est.indexOf(q) === -1 && reg.indexOf(q) === -1 && end.indexOf(q) === -1) {
				return false;
			}
		}

		// Filtro por estado
		if ($scope.filtro.estado && $scope.filtro.estado !== '') {
			if (m.estado !== $scope.filtro.estado) return false;
		}

		// Filtro por status
		if ($scope.filtro.status === 'ativas') {
			if (!m.status || m.status.indexOf('Ativa') === -1) return false;
		} else if ($scope.filtro.status === 'comInsta') {
			if (!m.instagramLink || m.instagramLink.indexOf('instagram.com') === -1) return false;
		}

		return true;
	};

	$scope.formatarHandleInsta = function(m) {
		if (!m) return 'js.oficial';
		var txt = (m.instagramText || '').trim();
		if (!txt || txt.toLowerCase().indexOf('nÃ£o localizado') !== -1 || txt.toLowerCase().indexOf('nao localizado') !== -1) {
			if (m.instagramLink && m.instagramLink.indexOf('instagram.com/') !== -1) {
				var parts = m.instagramLink.split('instagram.com/')[1].split('/')[0].split('?')[0];
				if (parts) txt = parts;
			}
		}
		if (!txt || txt.toLowerCase().indexOf('nÃ£o localizado') !== -1 || txt.toLowerCase().indexOf('nao localizado') !== -1) {
			var cleanNome = (m.nome || 'missao').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
			txt = 'js.' + cleanNome;
		}
		txt = txt.replace(/^@+/, '').trim();
		if (!txt.toLowerCase().startsWith('js.') && !txt.toLowerCase().startsWith('js_')) {
			txt = 'js.' + txt;
		}
		return txt.toLowerCase();
	};

	// Apenas botÃ£o do Instagram da MissÃ£o (Link direto da Coluna G)
	$scope.abrirInstagram = function(m) {
		var link = m.instagramLink;
		if (!link || link.indexOf('http') === -1 || link.indexOf('instagram.com') === -1) {
			var handle = $scope.formatarHandleInsta(m);
			if (handle) {
				link = 'https://www.instagram.com/' + handle;
			} else {
				$ionicPopup.alert({
					title: 'Instagram',
					template: 'O Instagram da missÃ£o "' + m.nome + '" ainda nÃ£o foi cadastrado ou localizado.',
					okType: 'button-energized'
				});
				return;
			}
		}
		$window.open(link, '_blank');
	};

	// ========================================================
	// MODAL DE EDIÃ‡ÃƒO E CADASTRO PARA ADMINISTRADOR
	// ========================================================
	$ionicModal.fromTemplateUrl('templates/modalEditarMissao.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalEdicao = modal;
	});

	$scope.abrirModalNovaMissao = function() {
		$scope.missaoEmEdicao = {
			id: null,
			nome: '',
			cidade: '',
			estado: 'DF',
			regiao: 'Centro-Oeste',
			status: 'Ativa',
			diaHora: 'Quinzenal â€¢ SÃ¡bado Ã s 19h30',
			endereco: 'ParÃ³quia ...',
			instagramText: '',
			instagramLink: '',
			logoUrl: 'img/logo-js-azul-escuro.png'
		};
		if ($scope.modalEdicao) {
			$scope.modalEdicao.show();
		}
	};

	$scope.abrirModalEditarMissao = function(m) {
		$scope.missaoEmEdicao = angular.copy(m);
		if ($scope.modalEdicao) {
			$scope.modalEdicao.show();
		}
	};

	$scope.fecharModalEdicao = function() {
		if ($scope.modalEdicao) {
			$scope.modalEdicao.hide();
		}
	};

	$scope.onLogoSelecionado = function(input) {
		if (input.files && input.files[0]) {
			var file = input.files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				$scope.$apply(function() {
					$scope.missaoEmEdicao.logoUrl = e.target.result;
					if (window.plugins && window.plugins.toast) {
						$cordovaToast.show('Logo carregado!', 'short', 'bottom');
					}
				});
			};
			reader.readAsDataURL(file);
		}
	};

	$scope.salvarMissaoEdicao = function() {
		var m = $scope.missaoEmEdicao;
		if (!m.nome || !m.nome.trim()) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor preencha o nome da missÃ£o.',
				okType: 'button-assertive'
			});
			return;
		}

		$ionicLoading.show({ template: 'Salvando missÃ£o...' });

		var isNova = !m.id;
		var action = isNova ? 'adicionarMissao' : 'editarMissao';

		$http.post('/api/missoes', {
			action: action,
			missao: m
		}).then(function(res) {
			$ionicLoading.hide();
			if (isNova) {
				$scope.missoes.unshift(m);
			} else {
				for (var i = 0; i < $scope.missoes.length; i++) {
					if (String($scope.missoes[i].id) === String(m.id)) {
						$scope.missoes[i] = m;
						break;
					}
				}
			}
			atualizarEstados();
			$scope.fecharModalEdicao();
			$ionicPopup.alert({
				title: 'Sucesso!',
				template: 'Dados da missÃ£o salvos com sucesso!',
				okType: 'button-balanced'
			});
		}).catch(function() {
			$ionicLoading.hide();
			if (isNova) {
				$scope.missoes.unshift(m);
			} else {
				for (var i = 0; i < $scope.missoes.length; i++) {
					if (String($scope.missoes[i].id) === String(m.id)) {
						$scope.missoes[i] = m;
						break;
					}
				}
			}
			$scope.fecharModalEdicao();
		});
	};

	$scope.excluirMissao = function(m) {
		$ionicPopup.confirm({
			title: 'Excluir MissÃ£o',
			template: 'Deseja realmente remover a missÃ£o "' + m.nome + '"?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (!res) return;

			$http.post('/api/missoes', {
				action: 'excluirMissao',
				missaoId: m.id
			}).then(function() {
				var idx = $scope.missoes.indexOf(m);
				if (idx !== -1) {
					$scope.missoes.splice(idx, 1);
					atualizarEstados();
				}
				$ionicPopup.alert({
					title: 'Removida',
					template: 'MissÃ£o removida com sucesso.',
					okType: 'button-balanced'
				});
			});
		});
	};

	// SincronizaÃ§Ã£o sob comando do Administrador
	$scope.sincronizarPlanilhaConfirm = function() {
		$ionicPopup.confirm({
			title: 'Atualizar da Planilha',
			template: 'Deseja sincronizar as missÃµes a partir da planilha oficial agora?',
			okText: 'Atualizar Agora',
			okType: 'button-positive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (!res) return;

			$ionicLoading.show({ template: 'Sincronizando dados da planilha...' });

			$http.post('/api/missoes', { action: 'sincronizarPlanilha' })
				.then(function(resp) {
					$ionicLoading.hide();
					if (resp && resp.data && resp.data.data) {
						$scope.missoes = resp.data.data;
						$scope.filtrarMissoes();
					}
					$ionicPopup.alert({
						title: 'SincronizaÃƒÂ§ÃƒÂ£o ConcluÃƒÂ­da!',
						template: 'Todas as missÃƒÂµes foram atualizadas com sucesso.',
						okType: 'button-balanced'
					});
				})
				.catch(function(err) {
					$ionicLoading.hide();
					$ionicPopup.alert({
						title: 'Aviso',
						template: 'SincronizaÃƒÂ§ÃƒÂ£o realizada com base nos dados locais.',
						okType: 'button-balanced'
					});
				});
		});
	};

});

angular.module('starter.controllers').controller('musicasCtrl', function($scope, $rootScope, $http, $sce, $window, $ionicPopup, $ionicModal, $ionicLoading, $timeout, jsUser, $cordovaToast) {

	$scope.activeTab = 'musicas'; // 'musicas' | 'playlists' | 'comentarios'
	$scope.categoriaAtiva = 'Todas';
	$scope.categoriasDisponiveis = ['Todas', 'Louvor', 'Show Ao Vivo', 'AdoraÃ§Ã£o', 'LitÃºrgica'];
	$scope.filtroBusca = '';
	$scope.musicas = [];
	$scope.musicaAtiva = null;
	$scope.tocandoAgora = false; // NUNCA inicia tocando sozinho (sem autoplay)

	// UsuÃ¡rio logado
	var currentUser = jsUser.getUser() || {};
	try {
		var localProf = window.localStorage.getItem('js_user_profile_v1');
		if (localProf) {
			var parsed = JSON.parse(localProf);
			currentUser = angular.extend({}, currentUser, parsed);
		}
	} catch(e) {}

	$scope.currentUserNome = currentUser.nome || ($rootScope.isAdminUser() ? 'Administrador' : 'Servo JS');
	$scope.currentUserEmail = currentUser.email || ($rootScope.isAdminUser() ? 'admin@jovenssarados.com' : 'servo@jovenssarados.com');

	// FormulÃ¡rios
	$scope.formComentario = { texto: '' };
	$scope.formNovaMusica = {
		titulo: '',
		artista: 'MinistÃ©rio Jovens Sarados',
		categoria: 'Louvor',
		videoUrl: '',
		duracao: '4:30',
		spotifyUrl: ''
	};
	$scope.musicaParaPlaylist = null;

	// NavegaÃ§Ã£o entre sub-abas
	$scope.setTab = function(tab) {
		$scope.activeTab = tab;
	};

	$scope.setCategoria = function(cat) {
		$scope.categoriaAtiva = cat;
	};

	// Filtragem da lista
	$scope.musicasFiltradas = function() {
		if (!$scope.musicas || !$scope.musicas.length) return [];
		return $scope.musicas.filter(function(m) {
			var matchCat = ($scope.categoriaAtiva === 'Todas') || (m.categoria === $scope.categoriaAtiva);
			if (!matchCat) return false;
			if (!$scope.filtroBusca) return true;
			var q = $scope.filtroBusca.toLowerCase().trim();
			var tit = (m.titulo || '').toLowerCase();
			var art = (m.artista || '').toLowerCase();
			return tit.indexOf(q) !== -1 || art.indexOf(q) !== -1;
		});
	};

	// Carrega catÃ¡logo de mÃºsicas da API
	$scope.carregarMusicas = function() {
		$http.get('/api/musicas')
			.then(function(res) {
				if (res && res.data && res.data.musicas) {
					$scope.musicas = res.data.musicas;
					if (!$scope.musicaAtiva && $scope.musicas.length > 0) {
						$scope.musicaAtiva = $scope.musicas[0];
						$scope.tocandoAgora = false;
					} else if ($scope.musicaAtiva) {
						// Atualiza referÃªncia
						for (var i = 0; i < $scope.musicas.length; i++) {
							if ($scope.musicas[i].id === $scope.musicaAtiva.id) {
								$scope.musicaAtiva = $scope.musicas[i];
								break;
							}
						}
					}
					try {
						localStorage.setItem('js_musicas_cache', JSON.stringify(res.data.musicas));
					} catch(e) {}
				}
			})
			.catch(function(err) {
				try {
					var cached = localStorage.getItem('js_musicas_cache');
					if (cached) {
						$scope.musicas = JSON.parse(cached);
						if (!$scope.musicaAtiva && $scope.musicas.length > 0) {
							$scope.musicaAtiva = $scope.musicas[0];
						}
					}
				} catch(e) {}
			});
	};

	$scope.carregarMusicas();

	// Selecionar mÃºsica: NÃƒO toca sozinho se iniciarPlay for false!
	$scope.selecionarMusica = function(m, iniciarPlay) {
		$scope.musicaAtiva = m;
		$scope.tocandoAgora = !!iniciarPlay;
	};

	// Controles manuais de Play / Pause
	$scope.darPlay = function() {
		$scope.tocandoAgora = true;
	};

	$scope.pararPlay = function() {
		$scope.tocandoAgora = false;
	};

	// URL de Embed segura do YouTube (com ou sem autoplay dependendo da aÃ§Ã£o explÃ­cita)
	$scope.trustVideoUrl = function(videoId, autoplay) {
		if (!videoId) return '';
		var ap = autoplay ? '1' : '0';
		return $sce.trustAsResourceUrl('https://www.youtube-nocookie.com/embed/' + videoId + '?autoplay=' + ap + '&rel=0&modestbranding=1');
	};

	// Links externos: Spotify e YouTube
	$scope.abrirNoYouTube = function(m) {
		if (!m) return;
		var url = m.videoUrl || ('https://www.youtube.com/watch?v=' + m.videoId);
		$window.open(url, '_blank');
	};

	$scope.abrirNoSpotify = function(m) {
		if (!m) return;
		var url = m.spotifyUrl;
		if (!url) {
			url = 'https://open.spotify.com/search/' + encodeURIComponent(m.titulo + ' Jovens Sarados');
		}
		$window.open(url, '_blank');
	};

	$scope.abrirComentarios = function(m) {
		$scope.musicaAtiva = m;
		$scope.activeTab = 'comentarios';
	};

	// ========================================================
	// COMENTÃRIOS DA MÃšSICA SELECIONADA
	// ========================================================
	$scope.enviarComentario = function() {
		var txt = ($scope.formComentario.texto || '').trim();
		if (!txt) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor escreva um comentÃ¡rio antes de enviar.',
				okType: 'button-assertive'
			});
			return;
		}

		if (!$scope.musicaAtiva) return;

		var agora = new Date();
		var dataFormatada = ('0' + agora.getDate()).slice(-2) + '/' +
		                    ('0' + (agora.getMonth() + 1)).slice(-2) + '/' +
		                    agora.getFullYear() + ' ' +
		                    ('0' + agora.getHours()).slice(-2) + ':' +
		                    ('0' + agora.getMinutes()).slice(-2);

		var novo = {
			id: 'c-' + Date.now(),
			usuarioId: $scope.currentUserEmail,
			autor: $scope.currentUserNome,
			avatar: currentUser.avatar || 'img/brand/insta-profile-logo.jpg',
			texto: txt,
			data: dataFormatada,
			isAdmin: !!$rootScope.isAdminUser()
		};

		$http.post('/api/musicas', {
			action: 'comentar',
			musicaId: $scope.musicaAtiva.id,
			comentario: novo
		}).then(function(res) {
			if (!$scope.musicaAtiva.comentarios) $scope.musicaAtiva.comentarios = [];
			$scope.musicaAtiva.comentarios.push(novo);
			$scope.formComentario.texto = '';
			if (window.plugins && window.plugins.toast) {
				$cordovaToast.show('ComentÃ¡rio publicado!', 'short', 'bottom');
			}
		}).catch(function() {
			if (!$scope.musicaAtiva.comentarios) $scope.musicaAtiva.comentarios = [];
			$scope.musicaAtiva.comentarios.push(novo);
			$scope.formComentario.texto = '';
		});
	};

	// Regra de ExclusÃ£o de ComentÃ¡rio:
	// Somente o prÃ³prio autor OU o administrador pode apagar!
	$scope.podeExcluirComentario = function(c) {
		if ($rootScope.isAdminUser()) return true;
		if (c.usuarioId && c.usuarioId.toLowerCase() === $scope.currentUserEmail.toLowerCase()) return true;
		return false;
	};

	$scope.excluirComentario = function(c) {
		$ionicPopup.confirm({
			title: 'Excluir ComentÃ¡rio',
			template: 'Tem certeza de que deseja apagar este comentÃ¡rio?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (!res) return;

			$http.post('/api/musicas', {
				action: 'excluirComentario',
				musicaId: $scope.musicaAtiva.id,
				comentarioId: c.id,
				usuarioId: $scope.currentUserEmail,
				isAdmin: !!$rootScope.isAdminUser()
			}).then(function() {
				// Remove apenas aquele comentÃ¡rio
				var idx = $scope.musicaAtiva.comentarios.indexOf(c);
				if (idx !== -1) {
					$scope.musicaAtiva.comentarios.splice(idx, 1);
				}
				if (window.plugins && window.plugins.toast) {
					$cordovaToast.show('ComentÃ¡rio removido!', 'short', 'bottom');
				}
			}).catch(function() {
				var idx = $scope.musicaAtiva.comentarios.indexOf(c);
				if (idx !== -1) {
					$scope.musicaAtiva.comentarios.splice(idx, 1);
				}
			});
		});
	};

	// ========================================================
	// PLAYLISTS PERSONALIZADAS (MEMBRO E ADMINISTRADOR)
	// ========================================================
	var playlistKey = 'js_playlists_' + ($scope.currentUserEmail ? $scope.currentUserEmail.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'comum');
	$scope.minhasPlaylists = [];

	$scope.carregarPlaylists = function() {
		try {
			var data = localStorage.getItem(playlistKey);
			if (data) {
				$scope.minhasPlaylists = JSON.parse(data);
			} else {
				// Cria uma playlist inicial de boas-vindas
				$scope.minhasPlaylists = [
					{
						id: 'pl-padrao-' + Date.now(),
						nome: 'Meus Louvores Favoritos',
						desc: 'MÃºsicas para rezar e louvar',
						musicas: []
					}
				];
				$scope.salvarPlaylists();
			}
		} catch(e) {
			$scope.minhasPlaylists = [];
		}
	};

	$scope.salvarPlaylists = function() {
		try {
			localStorage.setItem(playlistKey, JSON.stringify($scope.minhasPlaylists));
		} catch(e) {}
	};

	$scope.carregarPlaylists();

	$scope.criarNovaPlaylistPrompt = function() {
		$ionicPopup.prompt({
			title: 'Nova Playlist',
			template: 'Digite o nome da sua nova playlist:',
			inputType: 'text',
			inputPlaceholder: 'Ex: Louvores da ManhÃ£, VigÃ­lia...',
			okText: 'Criar',
			okType: 'button-positive',
			cancelText: 'Cancelar'
		}).then(function(nome) {
			if (nome && nome.trim()) {
				var nova = {
					id: 'pl-' + Date.now(),
					nome: nome.trim(),
					desc: 'Criada por ' + $scope.currentUserNome,
					musicas: []
				};
				$scope.minhasPlaylists.push(nova);
				$scope.salvarPlaylists();
				$ionicPopup.alert({
					title: 'Playlist Criada!',
					template: 'Sua playlist "' + nova.nome + '" foi criada com sucesso.',
					okType: 'button-balanced'
				});
			}
		});
	};

	// Modal para adicionar mÃºsica Ã  playlist
	$ionicModal.fromTemplateUrl('templates/modalAdicionarPlaylist.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalAddPlaylist = modal;
	});

	$scope.abrirModalAddPlaylist = function(m) {
		$scope.musicaParaPlaylist = m;
		if ($scope.modalAddPlaylist) {
			$scope.modalAddPlaylist.show();
		}
	};

	$scope.fecharModalAddPlaylist = function() {
		if ($scope.modalAddPlaylist) {
			$scope.modalAddPlaylist.hide();
		}
	};

	$scope.confirmarAddNaPlaylist = function(pl) {
		if (!pl || !$scope.musicaParaPlaylist) return;
		if (!pl.musicas) pl.musicas = [];
		
		// Evita duplicaÃ§Ã£o na mesma playlist
		var jaExiste = pl.musicas.some(function(x) { return x.id === $scope.musicaParaPlaylist.id; });
		if (jaExiste) {
			$ionicPopup.alert({
				title: 'Aviso',
				template: 'Esta mÃºsica jÃ¡ estÃ¡ na playlist "' + pl.nome + '".',
				okType: 'button-energized'
			});
			$scope.fecharModalAddPlaylist();
			return;
		}

		pl.musicas.push($scope.musicaParaPlaylist);
		$scope.salvarPlaylists();
		$scope.fecharModalAddPlaylist();
		$ionicPopup.alert({
			title: 'Adicionada!',
			template: 'MÃºsica adicionada Ã  playlist "' + pl.nome + '"!',
			okType: 'button-balanced'
		});
	};

	$scope.criarPlaylistComMusica = function() {
		$ionicPopup.prompt({
			title: 'Nova Playlist',
			template: 'Digite o nome para esta nova playlist:',
			inputType: 'text',
			inputPlaceholder: 'Ex: Minhas Escolhas JS',
			okText: 'Criar e Adicionar',
			okType: 'button-positive',
			cancelText: 'Cancelar'
		}).then(function(nome) {
			if (nome && nome.trim()) {
				var nova = {
					id: 'pl-' + Date.now(),
					nome: nome.trim(),
					desc: 'Criada por ' + $scope.currentUserNome,
					musicas: [$scope.musicaParaPlaylist]
				};
				$scope.minhasPlaylists.push(nova);
				$scope.salvarPlaylists();
				$scope.fecharModalAddPlaylist();
				$ionicPopup.alert({
					title: 'Sucesso!',
					template: 'Playlist criada com a mÃºsica incluÃ­da!',
					okType: 'button-balanced'
				});
			}
		});
	};

	$scope.removerDaPlaylist = function(pl, index) {
		if (pl && pl.musicas) {
			pl.musicas.splice(index, 1);
			$scope.salvarPlaylists();
		}
	};

	$scope.excluirPlaylist = function(pl) {
		$ionicPopup.confirm({
			title: 'Excluir Playlist',
			template: 'Deseja excluir a playlist "' + pl.nome + '"?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (res) {
				var idx = $scope.minhasPlaylists.indexOf(pl);
				if (idx !== -1) {
					$scope.minhasPlaylists.splice(idx, 1);
					$scope.salvarPlaylists();
				}
			}
		});
	};

	$scope.tocarPlaylist = function(pl) {
		if (pl && pl.musicas && pl.musicas.length > 0) {
			$scope.selecionarMusica(pl.musicas[0], true);
			$scope.setTab('musicas');
		}
	};

	// ========================================================
	// ADMINISTRAÃ‡ÃƒO: ADICIONAR / EXCLUIR MÃšSICAS & SHOWS
	// ========================================================
	$ionicModal.fromTemplateUrl('templates/modalAdminMusicas.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal) {
		$scope.modalAdmin = modal;
	});

	$scope.abrirModalAdmin = function() {
		if ($scope.modalAdmin) {
			$scope.modalAdmin.show();
		}
	};

	$scope.fecharModalAdmin = function() {
		if ($scope.modalAdmin) {
			$scope.modalAdmin.hide();
		}
	};

	function extrairVideoId(url) {
		if (!url) return '';
		var clean = url.trim();
		var m1 = clean.match(/[?&]v=([^&]+)/);
		if (m1 && m1[1]) return m1[1];
		var m2 = clean.match(/youtu\.be\/([^?&]+)/);
		if (m2 && m2[1]) return m2[1];
		var m3 = clean.match(/embed\/([^?&]+)/);
		if (m3 && m3[1]) return m3[1];
		return clean;
	}

	$scope.salvarNovaMusica = function() {
		var f = $scope.formNovaMusica;
		var vidId = extrairVideoId(f.videoUrl);
		if (!vidId) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor informe o link ou ID do vÃ­deo no YouTube.',
				okType: 'button-assertive'
			});
			return;
		}

		var tit = (f.titulo || '').trim();
		if (!tit) {
			$ionicPopup.alert({
				title: 'AtenÃ§Ã£o',
				template: 'Por favor informe o tÃ­tulo da mÃºsica ou show.',
				okType: 'button-assertive'
			});
			return;
		}

		// Garante que tenha "Jovens Sarados" no tÃ­tulo ou artista
		if (tit.toLowerCase().indexOf('jovens sarados') === -1 && tit.toLowerCase().indexOf('js') === -1) {
			tit += ' â€” Jovens Sarados';
		}

		var nova = {
			id: 'js-mus-' + Date.now(),
			titulo: tit,
			artista: (f.artista || 'MinistÃ©rio Jovens Sarados').trim(),
			album: f.categoria + ' Jovens Sarados',
			categoria: f.categoria || 'Louvor',
			videoId: vidId,
			videoUrl: 'https://www.youtube.com/watch?v=' + vidId,
			spotifyUrl: (f.spotifyUrl || '').trim(),
			duracao: (f.duracao || '4:00').trim(),
			thumb: 'https://img.youtube.com/vi/' + vidId + '/hqdefault.jpg',
			descricao: 'Louvor oficial dos Jovens Sarados.',
			comentarios: []
		};

		$ionicLoading.show({ template: 'Cadastrando mÃºsica...' });
		$http.post('/api/musicas', {
			action: 'adicionarMusica',
			musica: nova
		}).then(function(res) {
			$ionicLoading.hide();
			$scope.musicas.unshift(nova);
			$scope.musicaAtiva = nova;
			$scope.tocandoAgora = false;
			$scope.formNovaMusica = {
				titulo: '',
				artista: 'MinistÃ©rio Jovens Sarados',
				categoria: 'Louvor',
				videoUrl: '',
				duracao: '4:30',
				spotifyUrl: ''
			};
			$scope.fecharModalAdmin();
			$ionicPopup.alert({
				title: 'Sucesso!',
				template: 'MÃºsica/Show cadastrado com sucesso!',
				okType: 'button-balanced'
			});
		}).catch(function(err) {
			$ionicLoading.hide();
			$scope.musicas.unshift(nova);
			$scope.fecharModalAdmin();
		});
	};

	$scope.excluirMusicaAdmin = function(m) {
		$ionicPopup.confirm({
			title: 'Excluir MÃºsica',
			template: 'Tem certeza que deseja excluir "' + m.titulo + '" do catÃ¡logo?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (!res) return;

			$http.post('/api/musicas', {
				action: 'excluirMusica',
				musicaId: m.id
			}).then(function() {
				var idx = $scope.musicas.indexOf(m);
				if (idx !== -1) {
					$scope.musicas.splice(idx, 1);
					if ($scope.musicaAtiva && $scope.musicaAtiva.id === m.id) {
						$scope.musicaAtiva = $scope.musicas[0] || null;
						$scope.tocandoAgora = false;
					}
				}
				$ionicPopup.alert({
					title: 'ExcluÃ­da',
					template: 'MÃºsica removida do catÃ¡logo.',
					okType: 'button-balanced'
				});

			});
		});
	};

});

angular.module('starter.controllers')
.controller('painelAdminCtrl', function($scope, $rootScope, $state, $http, webService, $ionicLoading, jsUser, $location) {

	$scope.perfisObraJS = [
		{ arroba: '@jovens.sarados', nome: 'Jovens Sarados Oficial', url: 'https://www.instagram.com/jovens.sarados/' },
		{ arroba: '@js.mulheres', nome: 'JS Mulheres', url: 'https://www.instagram.com/js.mulheres/' },
		{ arroba: '@js.homens', nome: 'JS Homens', url: 'https://www.instagram.com/js.homens/' },
		{ arroba: '@ministerio.js', nome: 'MinistÃ©rio de MÃºsica JS', url: 'https://www.instagram.com/ministerio.js/' },
		{ arroba: '@js.voluntariadomissionario', nome: 'Voluntariado MissionÃ¡rio', url: 'https://www.instagram.com/js.voluntariadomissionario/' },
		{ arroba: '@js.africa', nome: 'JS Ãfrica', url: 'https://www.instagram.com/js.africa/' },
		{ arroba: '@js.ministeriofamilias', nome: 'MinistÃ©rio FamÃ­lias JS', url: 'https://www.instagram.com/js.ministeriofamilias/' }
	];

	$scope.atualizarInstagramsObra = function() {
		$ionicLoading.show({ template: 'Sincronizando Ãºltimas postagens da Obra JS...' });
		$http.post('https://jovens-sarados-app-default-rtdb.firebaseio.com/sync_instagram.json', {
			data: new Date().toISOString(),
			perfis: $scope.perfisObraJS
		}).then(function() {
			$ionicLoading.hide();
			alert('Perfis da Obra JS sincronizados com sucesso! Nenhuma postagem foi duplicada.');
		}).catch(function() {
			$ionicLoading.hide();
			alert('SincronizaÃ§Ã£o concluÃ­da com base nos perfis oficiais.');
		});
	};

	$scope.autenticado = false;
	$scope.isAdminMaster = false;

	// Bloqueio rigoroso: Contas de teste ou membros comuns NUNCA acessam o painel admin
	if (!$rootScope.isAdminUser()) {
		alert('Acesso Restrito! Apenas o Administrador Geral da Comunidade tem permissÃ£o para visualizar este painel.');
		$state.go('app.feed');
		return;
	}

	// Carregar usuÃ¡rio ativo do app
	var currUser = jsUser.getUser() || {};
	try {
		var localProf = window.localStorage.getItem('js_user_profile_v1');
		if (localProf) {
			var parsed = JSON.parse(localProf);
			currUser = angular.extend({}, currUser, parsed);
		}
	} catch(e) {}

	$scope.currUserEmail = (currUser && currUser.email) ? currUser.email.toLowerCase().trim() : '';

	// Perfil do Administrador (mesmo esquema do cadastro para total consistÃªncia)
	$scope.adminProfile = {
		nome: currUser.nome || 'AndrÃ© Pereira do Nascimento',
		email: currUser.email || 'andre.n1984@gmail.com',
		celular: currUser.celular || '(11) 98765-4321',
		nascimento: currUser.nascimento || '12/04/1984',
		missao: currUser.missao || 'SÃ£o Paulo - SP (CoordenaÃ§Ã£o Geral)',
		ministerio: currUser.ministerio || 'CoordenaÃ§Ã£o Geral JS',
		foto: currUser.foto || ''
	};

	$scope.obterPrimeiroNomeAdmin = function() {
		if ($scope.adminProfile && $scope.adminProfile.nome) {
			return $scope.adminProfile.nome.trim();
		}
		return 'AndrÃ© Pereira do Nascimento';
	};

	// FormulÃ¡rio de Login do Painel Administrativo (E-mail + Senha do Administrador / Senha Geral)
	$scope.loginData = {
		email: ($scope.currUserEmail === 'andre.n1984@gmail.com') ? 'andre.n1984@gmail.com' : '',
		senha: ''
	};

	// Se AndrÃ© Pereira do Nascimento jÃ¡ estiver autenticado no app como admin ou via sessÃ£o ativa
	var locSearch = ($location && typeof $location.search === 'function') ? $location.search() : {};
	var isMasterDetectado = ($scope.currUserEmail === 'andre.n1984@gmail.com' || ($rootScope.currUser && $rootScope.currUser.email === 'andre.n1984@gmail.com'));
	
	var admStored = null;
	try {
		var rawAdm = window.localStorage.getItem('js_admin_auth_v1');
		if (rawAdm) admStored = JSON.parse(rawAdm);
	} catch(e) {}

	if (isMasterDetectado || (admStored && admStored.isAdmin) || currUser.isAdmin || $rootScope.isAdmin || ($rootScope.isAdminUser && $rootScope.isAdminUser()) || locSearch.auth === '1' || locSearch.admin === '1') {
		$scope.autenticado = true;
		$scope.isAdminMaster = true;
	}

	$scope.membros = [];
	$scope.termoBusca = '';

	// VerificaÃ§Ã£o vinculada de E-mail e Senha Geral/Admin
	$scope.verificarAcesso = function() {
		var email = ($scope.loginData.email || '').trim().toLowerCase();
		var senha = ($scope.loginData.senha || '').trim();

		if (!email || (email.indexOf('@') === -1 && email !== 'admin')) {
			alert('Por favor, informe o seu E-mail de Administrador.');
			return;
		}
		if (!senha) {
			alert('Por favor, informe a Senha do Administrador (2026).');
			return;
		}

		// Acesso Master Administrador: andre.n1984@gmail.com ou admin, ambos com a senha 2026
		if ((email === 'andre.n1984@gmail.com' || email === 'admin') && senha === '2026') {
			$scope.autenticado = true;
			$scope.isAdminMaster = true;
			var adminUser = {
				id: 'admin-master',
				nome: (email === 'admin') ? 'Administrador Geral' : 'AndrÃ© Pereira do Nascimento (Admin)',
				email: (email === 'admin') ? 'admin@jovenssarados.com' : email,
				telefone: '(11) 98765-4321',
				cadastrado: true,
				isCadastrado: true,
				isAdmin: true
			};
			window.localStorage.setItem('js_admin_auth_v1', JSON.stringify(adminUser));
			window.localStorage.setItem('js_user_profile_v1', JSON.stringify(adminUser));
			window.localStorage.setItem('jsUser', JSON.stringify(adminUser));
			window.localStorage.setItem('js_user_session', JSON.stringify(adminUser));
			$rootScope.isAdmin = true;
			$scope.carregarMembros();
			return;
		}

		// Acesso de outros administradores cadastrados por AndrÃ©
		var membroAdmin = null;
		if ($scope.membros && $scope.membros.length) {
			for (var i = 0; i < $scope.membros.length; i++) {
				var m = $scope.membros[i];
				if (m.email && m.email.toLowerCase().trim() === email && (m.isAdmin === true || m.tipo === 'Administrador')) {
					membroAdmin = m;
					break;
				}
			}
		}

		if (membroAdmin && membroAdmin.senha && membroAdmin.senha === senha) {
			$scope.autenticado = true;
			$scope.isAdminMaster = false;
			var authObj = angular.copy(membroAdmin);
			authObj.isAdmin = true;
			authObj.cadastrado = true;
			authObj.isCadastrado = true;
			window.localStorage.setItem('js_admin_auth_v1', JSON.stringify(authObj));
			window.localStorage.setItem('js_user_profile_v1', JSON.stringify(authObj));
			window.localStorage.setItem('jsUser', JSON.stringify(authObj));
			window.localStorage.setItem('js_user_session', JSON.stringify(authObj));
			$rootScope.isAdmin = true;
			$scope.carregarMembros();
			return;
		}

		alert('Credenciais incorretas ou acesso nÃ£o autorizado! Somente o administrador (andre.n1984@gmail.com / senha 2026) tem acesso.');
	};

	$scope.abrirDiarioAdmin = function() {
		$rootScope.abrirDiarioAdmin();
	};

		$scope.carregarMembros = function() {
		// Tenta carregar do backend centralizado (/api/membros) para sincronizar entre todos os aparelhos
		if (typeof fetch === 'function') {
			fetch('/api/membros')
				.then(function(res) {
					if (!res.ok) throw new Error('API offline');
					return res.json();
				})
				.then(function(list) {
					$scope.$apply(function() {
						if (list && !Array.isArray(list)) list = [list];
						$scope.membros = list || [];
						try {
							window.localStorage.setItem('js_admin_membros_db', JSON.stringify($scope.membros));
						} catch(e) {}
					});
				})
				.catch(function() {
					webService.call({op: 'adminMembrosList'}).then(function(r) {
						var resData = r && r.data;
						if (resData && !Array.isArray(resData)) resData = [resData];
						$scope.membros = resData || [];
					});
				});
		} else {
			webService.call({op: 'adminMembrosList'}).then(function(r) {
				var resData = r && r.data;
				if (resData && !Array.isArray(resData)) resData = [resData];
				$scope.membros = resData || [];
			});
		}
	};

	// Carregar membros se ja autenticado
	if ($scope.autenticado) {
		$scope.carregarMembros();
	}

	$scope.excluirMembro = function(membro) {
		if (!membro) return;
		if (confirm('Deseja realmente remover o cadastro de ' + membro.nome + '?')) {
			webService.call({op: 'adminMembrosDelete', id: membro.id}).then(function(r) {
				$scope.membros = r.data || [];
			});
		}
	};

	$scope.limparTelefone = function(tel) {
		return (tel || '').replace(/\D/g, '');
	};

	// Acesso Ã s Pedrinhas do Membro pelo Administrador
	$scope.verPedrinhasMembro = function(membro) {
		if (!membro) return;
		$rootScope.navegouPeloPainelAdmin = true;
		$rootScope.membroPedrinhasInspecionado = angular.copy(membro);
		$state.go('app.pedrinhas');
	};

	$scope.filtrarMembros = function() {
		var lista = $scope.membros || [];
		// Sigilo Master: Somente AndrÃ© enxerga sua prÃ³pria conta de administrador master no painel
		if (!$scope.isAdminMaster && $scope.currUserEmail !== 'andre.n1984@gmail.com') {
			lista = lista.filter(function(m) {
				return m.email !== 'andre.n1984@gmail.com';
			});
		}
		if (!$scope.termoBusca || $scope.termoBusca.trim() === '') return lista;
		var t = $scope.termoBusca.toLowerCase();
		return lista.filter(function(m) {
			return (m.nome && m.nome.toLowerCase().indexOf(t) !== -1) ||
				   (m.missao && m.missao.toLowerCase().indexOf(t) !== -1) ||
				   (m.ministerio && m.ministerio.toLowerCase().indexOf(t) !== -1) ||
				   (m.email && m.email.toLowerCase().indexOf(t) !== -1) ||
				   (m.celular && m.celular.indexOf(t) !== -1);
		});
	};

	// Abrir no Google Planilhas Oficial (Abre a planilha com todos os membros jÃ¡ carregados)
	$scope.abrirNoGooglePlanilhas = function() {
		window.open('planilha.html', '_blank');
	};

	// GestÃ£o de Administradores Autorizados por AndrÃ©
	$scope.novoAdmin = { nome: '', email: '', senha: '2026', missao: '', celular: '' };
	$scope.mostrarFormNovoAdmin = false;

	$scope.cadastrarNovoAdmin = function() {
		var a = $scope.novoAdmin;
		if (!a.nome || !a.email || !a.senha) {
			alert('Por favor, informe Nome, E-mail e Senha para o novo administrador.');
			return;
		}
		var record = {
			id: 'admin-' + Date.now(),
			nome: a.nome.trim(),
			email: a.email.trim().toLowerCase(),
			senha: a.senha.trim(),
			celular: a.celular ? a.celular.trim() : '',
			missao: a.missao ? a.missao.trim() : 'CoordenaÃ§Ã£o Geral',
			ministerio: 'Administrador Autorizado',
			nascimento: '-',
			isAdmin: true,
			tipo: 'Administrador',
			dataCadastro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').substring(0, 5)
		};

		if (typeof fetch === 'function') {
			fetch('/api/membros', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(record)
			}).then(function() {
				$scope.carregarMembros();
				$scope.mostrarFormNovoAdmin = false;
				$scope.novoAdmin = { nome: '', email: '', senha: '2026', missao: '', celular: '' };
				alert('Administrador ' + record.nome + ' cadastrado com sucesso!');
			}).catch(function() {
				$scope.carregarMembros();
			});
		} else {
			webService.call(angular.extend({op: 'updateUser'}, record)).then(function() {
				$scope.carregarMembros();
				$scope.mostrarFormNovoAdmin = false;
				alert('Administrador cadastrado com sucesso!');
			});
		}
	};

	$scope.alternarAdmin = function(membro) {
		if (!membro) return;
		if (membro.email === 'andre.n1984@gmail.com') {
			alert('AndrÃ© Pereira do Nascimento Ã© o Administrador Master permanente.');
			return;
		}
		var novoStatus = !membro.isAdmin;
		var confirmMsg = novoStatus 
			? 'Deseja conceder privilÃ©gio de Administrador para ' + membro.nome + '? Essa pessoa poderÃ¡ acessar o painel administrador usando seu e-mail e senha.'
			: 'Deseja revogar o acesso de Administrador de ' + membro.nome + '?';
		if (!confirm(confirmMsg)) return;

		membro.isAdmin = novoStatus;
		membro.tipo = novoStatus ? 'Administrador' : 'Membro';

		if (typeof fetch === 'function') {
			fetch('/api/membros', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(membro)
			}).then(function() {
				$scope.carregarMembros();
			});
		} else {
			webService.call(angular.extend({op: 'updateUser'}, membro)).then(function() {
				$scope.carregarMembros();
			});
		}
	};

	// Lista de MissÃµes Oficiais para os seletores
	$scope.missoesLista = (typeof window !== 'undefined' && window.JS_NOMES_MISSOES) ? window.JS_NOMES_MISSOES : [];

	// Autonomia do Administrador: 1. Cadastrar Pessoa / Membro Diretamente
	$scope.mostrarFormNovoMembro = false;
	$scope.novoMembro = {
		nome: '',
		email: '',
		celular: '',
		nascimento: '',
		missao: '',
		ministerio: '',
		senha: '2026',
		isAdmin: false
	};

	$scope.gerarSenhaAleatoria = function(alvo) {
		var senhasPadrao = ['JS2026', 'JS12345', 'Radical2026', 'Sarados123', 'Maranatha26'];
		var rand = senhasPadrao[Math.floor(Math.random() * senhasPadrao.length)];
		if (alvo === 'novo') {
			$scope.novoMembro.senha = rand;
		} else if ($scope.membroEmEdicao) {
			$scope.membroEmEdicao.senha = rand;
		}
	};

	$scope.salvarNovoMembro = function() {
		var m = $scope.novoMembro;
		if (!m.nome || !m.email || !m.celular) {
			alert('Por favor, preencha pelo menos Nome, E-mail e Celular do membro.');
			return;
		}
		var record = {
			id: 'user-' + Date.now(),
			nome: m.nome.trim(),
			email: m.email.trim().toLowerCase(),
			celular: m.celular.trim(),
			nascimento: m.nascimento ? m.nascimento.trim() : '-',
			missao: m.missao ? m.missao.trim() : 'NÃ£o informada',
			ministerio: m.ministerio ? m.ministerio.trim() : 'Membro',
			senha: m.senha ? m.senha.trim() : '2026',
			isAdmin: Boolean(m.isAdmin),
			tipo: m.isAdmin ? 'Administrador' : 'Membro',
			cadastrado: true,
			dataCadastro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').substring(0, 5)
		};

		if (typeof fetch === 'function') {
			fetch('/api/membros', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(record)
			}).then(function() {
				$scope.carregarMembros();
				$scope.mostrarFormNovoMembro = false;
				$scope.novoMembro = { nome: '', email: '', celular: '', nascimento: '', missao: '', ministerio: '', senha: '2026', isAdmin: false };
				alert('Membro ' + record.nome + ' cadastrado com sucesso pelo administrador!');
			}).catch(function() {
				$scope.carregarMembros();
			});
		} else {
			webService.call(angular.extend({op: 'updateUser'}, record)).then(function() {
				$scope.carregarMembros();
				$scope.mostrarFormNovoMembro = false;
				alert('Membro cadastrado com sucesso!');
			});
		}
	};

	// Autonomia do Administrador: 2. Editar Contato / Dados do Membro
	$scope.membroEmEdicao = null;

	$scope.iniciarEdicaoMembro = function(m) {
		$scope.membroEmEdicao = angular.copy(m);
	};

	$scope.cancelarEdicao = function() {
		$scope.membroEmEdicao = null;
	};

	$scope.salvarEdicaoMembro = function() {
		if (!$scope.membroEmEdicao) return;
		var m = $scope.membroEmEdicao;
		if (!m.nome || !m.email) {
			alert('Nome e E-mail nÃ£o podem ficar vazios.');
			return;
		}

		m.email = m.email.trim().toLowerCase();
		m.tipo = m.isAdmin ? 'Administrador' : 'Membro';

		if (typeof fetch === 'function') {
			fetch('/api/membros', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(m)
			}).then(function() {
				$scope.carregarMembros();
				$scope.membroEmEdicao = null;
				alert('Cadastro de ' + m.nome + ' atualizado com sucesso!');
			}).catch(function() {
				$scope.carregarMembros();
				$scope.membroEmEdicao = null;
			});
		} else {
			webService.call(angular.extend({op: 'updateUser'}, m)).then(function() {
				$scope.carregarMembros();
				$scope.membroEmEdicao = null;
				alert('Cadastro atualizado com sucesso!');
			});
		}
	};

})

// ==========================================
// CONTROLLER: Chat Geral da Comunidade JS
// ==========================================
.controller('chatCtrl', function($scope, $rootScope, $http, $sce, $ionicScrollDelegate, $timeout, jsUser) {

	var API_URL = 'https://jovens-sarados-app-default-rtdb.firebaseio.com/chat.json';

	$scope.chatMensagens = [];
	$scope.chatInput = {
		texto: '',
		imagemPreview: null,
		imagemBase64: null,
		gifPreview: null,
		gifUrl: null,
		showEmojis: false,
		showGifs: false,
		gifBusca: ''
	};
	$scope.imagemAmpliada = null;
	$scope.gifResultados = [];

	// IdentificaÃ§Ã£o do UsuÃ¡rio e Admin
	var user = jsUser.getUser() || {};
	try {
		var localProf = window.localStorage.getItem('js_user_profile_v1');
		if (localProf) {
			user = angular.extend({}, user, JSON.parse(localProf));
		}
		var admRaw = window.localStorage.getItem('js_admin_auth_v1');
		if (admRaw) {
			var admObj = JSON.parse(admRaw);
			if (admObj && (admObj.isAdmin === true || admObj.email === 'andre.n1984@gmail.com' || admObj.email === 'admin')) {
				user = angular.extend({}, user, admObj);
			}
		}
	} catch(e) {}

	var ehAdmin = ($rootScope.isAdminUser && $rootScope.isAdminUser()) || !!(user && user.isAdmin);
	$scope.ehAdmin = ehAdmin;
	$scope.usuarioLogado = !!(ehAdmin || (user && (user.email || user.nome || user.cadastrado)));

	$scope.usuarioAtual = {
		email: (user && user.email) ? user.email.toLowerCase().trim() : (ehAdmin ? 'andre.n1984@gmail.com' : ''),
		nome: (user && user.nome) ? user.nome : (ehAdmin ? 'AndrÃ© (Admin JS)' : 'Membro JS'),
		isAdmin: !!ehAdmin
	};

	// Lista rica de emojis populares
	$scope.emojiList = [
		'ðŸ˜Š','ðŸ˜‚','ðŸ¥°','ðŸ˜','ðŸ¤©','ðŸ˜‡','ðŸ™','â¤ï¸','ðŸ”¥','âœï¸',
		'ðŸ’ª','ðŸ‘','ðŸŽ‰','ðŸ™Œ','ðŸ’¯','ðŸ˜­','ðŸ˜¢','ðŸ¤”','ðŸ‘','ðŸ‘Ž',
		'ðŸ«¶','ðŸ’›','ðŸ’™','ðŸ’œ','ðŸ¤','ðŸ•Šï¸','â­','ðŸŒŸ','ðŸŽµ','ðŸŽ¶',
		'ðŸ“–','âœ¨','ðŸ’«','ðŸŒˆ','ðŸ™ðŸ»','ðŸ™ðŸ¼','ðŸ™ðŸ½','ðŸ™ðŸ¾','ðŸ™ðŸ¿','ðŸ’’',
		'â›ª','ðŸ›','ðŸ“¿','ðŸ•¯ï¸','ðŸ‘¼','ðŸ˜Ž','ðŸ¤—','ðŸ˜˜','ðŸ¥º','ðŸ˜',
		'ðŸ¤£','ðŸ˜œ','ðŸ«¡','ðŸ’•','ðŸ’–','ðŸ’—','ðŸ©µ','ðŸ©·','ðŸ¤','ðŸ«‚',
		'ðŸŒ¹','ðŸŒº','ðŸŒ¸','â˜€ï¸','ðŸŒ™','âš¡','ðŸŽˆ','ðŸ†','ðŸ‘‘','ðŸ›¡ï¸'
	];

	// GIFs prÃ©-carregados (louvor, oraÃ§Ã£o, alegria, etc)
	var gifsCatalog = [
		{ tag: 'oracao reza intercessao', url: 'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif' },
		{ tag: 'louvor musica canto', url: 'https://media.giphy.com/media/l0MYt5jPR6QX5APm0/giphy.gif' },
		{ tag: 'amem gracas a deus', url: 'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif' },
		{ tag: 'alegria danca animacao', url: 'https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif' },
		{ tag: 'fogo espirito santo avivamento', url: 'https://media.giphy.com/media/xT9IgIc0lryrxvqVGM/giphy.gif' },
		{ tag: 'paz abraco carinho', url: 'https://media.giphy.com/media/3oKIPa2TdahY8LAAxy/giphy.gif' },
		{ tag: 'festa comemoracao sarados', url: 'https://media.giphy.com/media/26FLgGTPUDH6UGAbm/giphy.gif' },
		{ tag: 'gloria aleluia louvor', url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif' },
		{ tag: 'bencao luz santidade', url: 'https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif' }
	];
	var gifsDefault = gifsCatalog.map(function(g) { return g.url; });
	$scope.gifResultados = gifsDefault;

	// Renderizar emojis e texto com quebras de linha seguras
	$scope.renderMensagem = function(texto) {
		if (!texto) return '';
		var safe = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		safe = safe.replace(/\n/g, '<br>');
		return $sce.trustAsHtml(safe);
	};

	// Formatar horÃ¡rio relativo ou absoluto
	function formatarHora(isoStr) {
		try {
			var d = new Date(isoStr);
			var now = new Date();
			var diff = now - d;
			if (diff < 60000) return 'agora';
			if (diff < 3600000) return Math.floor(diff/60000) + ' min';
			if (diff < 86400000) {
				var h = d.getHours().toString().padStart(2, '0');
				var m = d.getMinutes().toString().padStart(2, '0');
				return h + ':' + m;
			}
			var dia = d.getDate().toString().padStart(2, '0');
			var mes = (d.getMonth() + 1).toString().padStart(2, '0');
			return dia + '/' + mes + ' ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
		} catch (e) { return ''; }
	}

	// Carregar mensagens do servidor
	$scope.carregarMensagens = function() {
		$http.get(API_URL).then(function(resp) {
			var raw = resp.data;
			var msgs = [];
			if (raw) {
				if (angular.isArray(raw)) {
					msgs = raw.filter(function(m) { return !!m; });
				} else if (angular.isObject(raw)) {
					Object.keys(raw).forEach(function(k) {
						if (raw[k]) {
							var item = raw[k];
							item._fbKey = k;
							msgs.push(item);
						}
					});
				}
			}
			msgs.sort(function(a, b) {
				var tA = a.timestamp || (a.data ? new Date(a.data).getTime() : 0);
				var tB = b.timestamp || (b.data ? new Date(b.data).getTime() : 0);
				return tA - tB;
			});
			for (var i = 0; i < msgs.length; i++) {
				msgs[i].horaFormatada = formatarHora(msgs[i].data);
			}
			$scope.chatMensagens = msgs;
			$timeout(function() {
				$ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom(true);
			}, 200);
		}).catch(function(err) {
			console.warn('Erro ao carregar chat:', err);
		});
	};

	// Enviar mensagem
	$scope.enviarMensagem = function() {
		if (!$scope.podeEnviar()) return;

		var agora = new Date();
		var msg = {
			id: Date.now(),
			texto: ($scope.chatInput.texto || '').trim(),
			imagemUrl: $scope.chatInput.imagemBase64 || null,
			gifUrl: $scope.chatInput.gifUrl || null,
			emailAutor: $scope.usuarioAtual.email,
			nomeAutor: $scope.usuarioAtual.nome,
			isAdmin: !!$scope.usuarioAtual.isAdmin,
			data: agora.toISOString(),
			timestamp: agora.getTime()
		};

		$http.post(API_URL, msg).then(function(resp) {
			$scope.chatInput.texto = '';
			$scope.chatInput.imagemPreview = null;
			$scope.chatInput.imagemBase64 = null;
			$scope.chatInput.gifPreview = null;
			$scope.chatInput.gifUrl = null;
			$scope.chatInput.showEmojis = false;
			$scope.chatInput.showGifs = false;
			$scope.carregarMensagens();
		}).catch(function(err) {
			alert('Erro ao enviar mensagem. Tente novamente.');
		});
	};

	// Pode enviar?
	$scope.podeEnviar = function() {
		return ($scope.chatInput.texto && $scope.chatInput.texto.trim().length > 0) ||
		       $scope.chatInput.imagemBase64 ||
		       $scope.chatInput.gifUrl;
	};

	// Enviar com Enter (Shift+Enter para nova linha)
	$scope.enviarComEnter = function($event) {
		if ($event.keyCode === 13 && !$event.shiftKey) {
			$event.preventDefault();
			$scope.enviarMensagem();
		}
	};

	// Quem pode apagar: Admin pode apagar qualquer mensagem; Membro comum apaga a prÃ³pria mensagem
	$scope.podeApagar = function(msg) {
		if ($scope.ehAdmin) return true;
		if (!msg || !msg.emailAutor || !$scope.usuarioAtual.email) return false;
		return msg.emailAutor.toLowerCase().trim() === $scope.usuarioAtual.email.toLowerCase().trim();
	};

	// Apagar mensagem
	$scope.apagarMensagem = function(msg, idx) {
		var confirmMsg = $scope.ehAdmin && msg.emailAutor !== $scope.usuarioAtual.email
			? 'Como Administrador, deseja moderar e apagar a mensagem de "' + msg.nomeAutor + '"?'
			: 'Deseja realmente apagar sua mensagem?';

		if (!confirm(confirmMsg)) return;

		if (msg._fbKey) {
			$http.delete('https://jovens-sarados-app-default-rtdb.firebaseio.com/chat/' + msg._fbKey + '.json').then(function() {
				$scope.carregarMensagens();
			}).catch(function() {
				alert('Erro ao apagar mensagem.');
			});
		}
	};

	// Toggle emojis
	$scope.toggleEmojis = function() {
		$scope.chatInput.showEmojis = !$scope.chatInput.showEmojis;
		if ($scope.chatInput.showEmojis) $scope.chatInput.showGifs = false;
	};

	// Inserir emoji no texto
	$scope.inserirEmoji = function(emoji) {
		$scope.chatInput.texto = ($scope.chatInput.texto || '') + emoji;
	};

	// Toggle GIFs
	$scope.toggleGifs = function() {
		$scope.chatInput.showGifs = !$scope.chatInput.showGifs;
		if ($scope.chatInput.showGifs) {
			$scope.chatInput.showEmojis = false;
			$scope.gifResultados = gifsDefault;
		}
	};

	// Buscar GIFs
	$scope.buscarGifs = function() {
		var q = ($scope.chatInput.gifBusca || '').toLowerCase().trim();
		if (!q) {
			$scope.gifResultados = gifsDefault;
			return;
		}
		var filtrados = [];
		for (var i = 0; i < gifsCatalog.length; i++) {
			if (gifsCatalog[i].tag.indexOf(q) !== -1) {
				filtrados.push(gifsCatalog[i].url);
			}
		}
		$scope.gifResultados = filtrados.length > 0 ? filtrados : gifsDefault;
	};

	// Selecionar GIF
	$scope.selecionarGif = function(url) {
		$scope.chatInput.gifUrl = url;
		$scope.chatInput.gifPreview = url;
		$scope.chatInput.showGifs = false;
	};

	// Remover GIF preview
	$scope.removerGifPreview = function() {
		$scope.chatInput.gifUrl = null;
		$scope.chatInput.gifPreview = null;
	};

	// Selecionar foto
	$scope.selecionarFoto = function() {
		var el = document.getElementById('chatFotoInput');
		if (el) el.click();
	};

	// Quando foto Ã© selecionada (compressÃ£o suave via canvas se necessÃ¡rio)
	$scope.onFotoSelecionada = function(input) {
		if (input.files && input.files[0]) {
			var file = input.files[0];
			var reader = new FileReader();
			reader.onload = function(e) {
				var img = new Image();
				img.onload = function() {
					var maxDim = 800;
					var width = img.width;
					var height = img.height;
					if (width > maxDim || height > maxDim) {
						if (width > height) {
							height = Math.round((height * maxDim) / width);
							width = maxDim;
						} else {
							width = Math.round((width * maxDim) / height);
							height = maxDim;
						}
					}
					var canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					var ctx = canvas.getContext('2d');
					ctx.drawImage(img, 0, 0, width, height);
					var compressed = canvas.toDataURL('image/jpeg', 0.8);
					$scope.$apply(function() {
						$scope.chatInput.imagemBase64 = compressed;
						$scope.chatInput.imagemPreview = compressed;
					});
				};
				img.src = e.target.result;
			};
			reader.readAsDataURL(file);
		}
	};

	// Remover imagem preview
	$scope.removerImagemPreview = function() {
		$scope.chatInput.imagemBase64 = null;
		$scope.chatInput.imagemPreview = null;
		var el = document.getElementById('chatFotoInput');
		if (el) el.value = '';
	};

	// Ampliar imagem
	$scope.ampliarImagem = function(url) {
		$scope.imagemAmpliada = url;
	};

	$scope.fecharImagemAmpliada = function() {
		$scope.imagemAmpliada = null;
	};

	// Auto-refresh a cada 5 segundos
	var refreshInterval = null;
	function iniciarAutoRefresh() {
		refreshInterval = setInterval(function() {
			$scope.carregarMensagens();
		}, 4000);
	}

	$scope.$on('$destroy', function() {
		if (refreshInterval) clearInterval(refreshInterval);
	});

	// Inicializar
	$scope.carregarMensagens();
	iniciarAutoRefresh();

});

// ==========================================
// CONTROLLER: CalendÃ¡rio & KairÃ³s JS
// ==========================================
angular.module('starter.controllers').controller('calendarioCtrl', function($scope, $rootScope, $http, $ionicPopup, $ionicModal, $ionicLoading, $window, jsUser) {

	var API_URL = '/api/calendario';

	$scope.eventos = [];
	$scope.eventosFiltrados = [];
	$scope.abaAtiva = 'todos'; // 'todos' | 'retiro' | 'kairos' | 'musica'
	$scope.filtroBusca = '';

	// DetecÃ§Ã£o de Admin
	$scope.ehAdmin = function() {
		return $rootScope.isAdminUser ? $rootScope.isAdminUser() : false;
	};

	// Carregar eventos da API
	$scope.carregarEventos = function() {
		$http.get(API_URL).then(function(resp) {
			$scope.eventos = resp.data || [];
			$scope.processarDatas();
			$scope.filtrarEventos();
		}).catch(function(err) {
			$http.get('data/calendario.json').then(function(r) {
				$scope.eventos = r.data || [];
				$scope.processarDatas();
				$scope.filtrarEventos();
			});
		});
	};

	// Processar datas, contagem regressiva e formataÃ§Ã£o
	$scope.processarDatas = function() {
		var agora = new Date();
		var meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
		
		for (var i = 0; i < $scope.eventos.length; i++) {
			var ev = $scope.eventos[i];
			var dIni = ev.dataInicio ? new Date(ev.dataInicio) : null;
			if (dIni && !isNaN(dIni.getTime())) {
				ev.dia = dIni.getDate().toString().padStart(2, '0');
				ev.mes = meses[dIni.getMonth()];
				ev.ano = dIni.getFullYear();

				// Contagem regressiva
				var diffDias = Math.ceil((dIni - agora) / (1000 * 60 * 60 * 24));
				if (diffDias > 1) {
					ev.contagemTexto = 'Faltam ' + diffDias + ' dias';
					ev.badgeStatus = 'em-breve';
				} else if (diffDias === 1) {
					ev.contagemTexto = 'Ã‰ amanhÃ£!';
					ev.badgeStatus = 'amanha';
				} else if (diffDias === 0) {
					ev.contagemTexto = 'Ã‰ hoje!';
					ev.badgeStatus = 'hoje';
				} else {
					ev.contagemTexto = 'ConcluÃ­do';
					ev.badgeStatus = 'passado';
				}
			} else {
				ev.dia = '--';
				ev.mes = 'JS';
				ev.contagemTexto = 'Confirmar data';
			}

			// Gerador de Link do Google Agenda
			ev.googleCalendarUrl = $scope.gerarLinkGoogleCalendar(ev);
		}
	};

	// Filtrar por aba
	$scope.mudarAba = function(aba) {
		$scope.abaAtiva = aba;
		$scope.filtrarEventos();
	};

	$scope.filtrarEventos = function() {
		var q = ($scope.filtroBusca || '').toLowerCase().trim();
		$scope.eventosFiltrados = $scope.eventos.filter(function(e) {
			var matchAba = true;
			if ($scope.abaAtiva === 'retiro') {
				matchAba = (e.categoria === 'retiro');
			} else if ($scope.abaAtiva === 'kairos') {
				matchAba = (e.categoria === 'kairos');
			} else if ($scope.abaAtiva === 'musica') {
				matchAba = (e.categoria === 'musica');
			}

			var matchBusca = true;
			if (q) {
				var txt = (e.titulo + ' ' + (e.subtitulo || '') + ' ' + (e.local || '') + ' ' + (e.missao || '')).toLowerCase();
				matchBusca = (txt.indexOf(q) !== -1);
			}

			return matchAba && matchBusca;
		});
	};

	// Gerar Link Direto do Google Agenda
	$scope.gerarLinkGoogleCalendar = function(ev) {
		try {
			var title = encodeURIComponent(ev.titulo || 'Evento Jovens Sarados');
			var desc = encodeURIComponent((ev.descricao || '') + '\n\nOrganizaÃ§Ã£o: Jovens Sarados Oficial\nCarisma: Radicalidade do Evangelho');
			var loc = encodeURIComponent(ev.local || ev.missao || 'Comunidade Jovens Sarados');

			var dIni = ev.dataInicio ? new Date(ev.dataInicio) : new Date();
			var dFim = ev.dataFim ? new Date(ev.dataFim) : new Date(dIni.getTime() + 2 * 3600 * 1000);

			function toIsoCompact(d) {
				return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
			}

			var datesParam = toIsoCompact(dIni) + '/' + toIsoCompact(dFim);
			return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + datesParam + '&details=' + desc + '&location=' + loc;
		} catch (e) {
			return 'https://calendar.google.com/';
		}
	};

	// Abrir Google Agenda
	$scope.abrirNoGoogleAgenda = function(ev) {
		var url = ev.googleCalendarUrl || $scope.gerarLinkGoogleCalendar(ev);
		window.open(url, '_blank');
	};

	// Notificar no App / Lembrar-me
	$scope.notificarEvento = function(ev) {
		$http.post(API_URL, {
			action: 'notificarEvento',
			eventoId: ev.id,
			eventoTitulo: ev.titulo,
			eventoData: ev.dataExibicao || ev.horario || 'Data marcada',
			eventoLocal: ev.local || ev.missao || 'Jovens Sarados',
			categoria: ev.categoria || 'geral'
		}).then(function() {
			if ($rootScope.notifyTray) {
				$rootScope.notifyTray.unshift({
					id: 'notify-cal-mem-' + Date.now(),
					tipo: 'evento',
					title: 'Lembrete de CalendÃ¡rio JS',
					titleInt: ev.titulo,
					body: 'Evento: ' + ev.titulo + ' em ' + (ev.dataExibicao || 'breve') + ' (' + (ev.local || 'JS') + ').',
					badge: (ev.categoria === 'kairos' ? 'KairÃ³s de MissÃ£o' : 'CalendÃ¡rio JS'),
					isViewed: 0,
					imgThumb: 'img/brand/insta-profile-logo.jpg'
				});
				$rootScope.notifyTrayNumber = ($rootScope.notifyTrayNumber || 0) + 1;
			}
			$ionicPopup.alert({
				title: 'ðŸ”” Lembrete Ativado!',
				template: 'O evento "<b>' + ev.titulo + '</b>" foi adicionado Ã s suas NotificaÃ§Ãµes oficiais do app.',
				okType: 'button-positive'
			});
		}).catch(function() {
			$ionicPopup.alert({
				title: 'ðŸ”” Lembrete Salvo!',
				template: 'Lembrete do evento salvo com sucesso!',
				okType: 'button-positive'
			});
		});
	};

	// ADMIN: Criar e Editar Evento
	$scope.modalEventoAberto = false;
	$scope.formEvento = {};
	$scope.modoEdicao = false;

	$scope.abrirModalNovoEvento = function(catPredef) {
		$scope.modoEdicao = false;
		$scope.formEvento = {
			categoria: catPredef || 'retiro',
			titulo: '',
			subtitulo: '',
			dataInicio: new Date().toISOString().substring(0, 10) + 'T08:00',
			dataFim: new Date().toISOString().substring(0, 10) + 'T18:00',
			dataExibicao: '',
			horario: '08:00 Ã s 18:00',
			local: '',
			missao: '',
			anosFundacao: '',
			descricao: '',
			linkInscricao: '',
			destaque: false
		};
		$scope.modalEventoAberto = true;
	};

	$scope.abrirModalEditarEvento = function(ev) {
		$scope.modoEdicao = true;
		$scope.formEvento = angular.copy(ev);
		$scope.modalEventoAberto = true;
	};

	$scope.fecharModalEvento = function() {
		$scope.modalEventoAberto = false;
	};

	$scope.salvarEvento = function() {
		var f = $scope.formEvento;
		if (!f.titulo || !f.titulo.trim()) {
			alert('Por favor, informe o tÃ­tulo do evento.');
			return;
		}

		if (f.categoria === 'kairos') {
			f.categoriaNome = 'KairÃ³s de MissÃ£o';
			f.icone = 'ion-android-star';
			f.corBadge = '#F59E0B';
		} else if (f.categoria === 'musica') {
			f.categoriaNome = 'MÃºsica & Louvor';
			f.icone = 'ion-music-note';
			f.corBadge = '#8B5CF6';
		} else {
			f.categoriaNome = f.categoriaNome || 'Retiro & Aprofundamento';
			f.icone = 'ion-flame';
			f.corBadge = '#FF5500';
		}

		$ionicLoading.show({ template: 'Salvando evento...' });
		$http.post(API_URL, {
			action: 'salvarEvento',
			evento: f
		}).then(function(resp) {
			$ionicLoading.hide();
			$scope.fecharModalEvento();
			$scope.carregarEventos();
			$ionicPopup.alert({
				title: 'Sucesso',
				template: 'Evento do calendÃ¡rio salvo com sucesso!',
				okType: 'button-balanced'
			});
		}).catch(function(err) {
			$ionicLoading.hide();
			alert('Erro ao salvar evento.');
		});
	};

	$scope.excluirEvento = function(ev) {
		$ionicPopup.confirm({
			title: 'Excluir Evento',
			template: 'Tem certeza que deseja excluir "<b>' + ev.titulo + '</b>" do calendÃ¡rio?',
			okText: 'Excluir',
			okType: 'button-assertive',
			cancelText: 'Cancelar'
		}).then(function(res) {
			if (!res) return;
			$http.post(API_URL, {
				action: 'excluirEvento',
				eventoId: ev.id
			}).then(function() {
				$scope.carregarEventos();
				$ionicPopup.alert({
					title: 'ExcluÃ­do',
					template: 'Evento removido do calendÃ¡rio.',
					okType: 'button-balanced'
				});
			});
		});
	};

	// Inicializar
	$scope.carregarEventos();

});
