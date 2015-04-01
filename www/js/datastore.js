var datastore = {
	
	ref: undefined,
	traceRef: undefined,

	init: function(username, password) {
		this.ref = new Firebase("https://slac-dc.firebaseio.com/");

		var self = this;

		this.ref.authWithPassword({
			email    : username,
			password : password
			}, 

			function(error, authData) {
				if (error) {
					console.log("Login Failed!", error);

					navigator.notification.alert(
						'Login failed with error ' + error,
						null,
						'Login status',
						'Ok');
				} else {
					console.log("Authenticated successfully with payload:", authData);
					self.traceRef = self.ref.child("traces/" + authData.uid);

					$('#login-form').hide();

					$('.user-info').html('<em>Succesfully loged in to Firebase with UID:</em> ' + authData.uid);

					$('.btn-disabled-login').attr('disabled', false);
				}
			}
		);

		
	},

	addTrace: function(trace) {
		this.traceRef.push(trace);
	}
}