var datastore = {
	

	refBaseUrl: "https://slac-dc.firebaseio.com/",


	ref: undefined,
	traceRef: undefined,

	init: function(username, password) {
		this.ref = new Firebase(this.refBaseUrl);

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


		var connectedRef = this.ref.child(".info/connected");
		connectedRef.on("value", function(snap) {
		  if (snap.val() === true) {
		  	$('.ds-status').html('Firebase connection online');
		    $('.ds-status').removeClass('bg-danger');
		    $('.ds-status').addClass('bg-success');
		  } else {
		  	$('.ds-status').html('Firebase connection offline');
		    $('.ds-status').removeClass('bg-success');
		    $('.ds-status').addClass('bg-danger');
		  }
		});
		
	},

	addTrace: function(trace) {
		this.traceRef.push(trace, function(error) {

			if(error) {
				navigator.notification.alert(
						'Data not saved! ' + error,
						null,
						'Status',
						'Ok');
			}
			else {
				navigator.notification.alert(
						'Data saved!',
						null,
						'Status',
						'Ok');
			}
		});
	}
}