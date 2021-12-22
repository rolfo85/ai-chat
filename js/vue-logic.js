
var app = new Vue({
	template: `
	
		<div class="ipad-screen h-100 rounded bg-white position-relative" :class="{move: currentUser !== ''}">
			
			<div class="position-absolute w-100 h-100 overlay" v-if="status == 1">

				<div class="popup-page mx-auto users-list p-4">

					<button class="btn btn-link btn-close position-fixed bg-light" @click="closePopup()">&#10005;</button>

					<h2 class="text-center mb-4">User List</h2>

					<ul class="list-group bg-white">
						<li class="list-group-item d-flex" v-for="(user, index) in userList" :index="index" :id="user._id">
							<img :src="user.profilePicUrl" class="rounded-circle mr-3 p-0 img-fluid img-thumbnail" alt="Profile Picture">
							<div class="d-flex flex-wrap">
								<span class="w-100">{{user.name}}</span>
								<small class="border px-2 text-wrap">{{user.position}}</small>
							</div>
							<a v-if="user.added" class="badge badge-pill badge-primary align-self-center ml-auto" href="javascript:void(0)" @click="goToConversation(user)">Go to Chat</a>
							<a v-else aria-hidden="true" class="ml-auto add-btn btn btn-link align-self-center" href="javascript:void(0)" @click="addUser(user, index)">&#43;</a>
						</li>
					</ul>

				</div>

			</div>

			<main role="main" class="d-flex h-100">

				<aside class="wrap-conversations border-right" v-if="conversations.length > 0">

					<h3 class="text-center mt-4 mb-4">Existing conversations</h3>

					<ul class="list-group">
						<li :class="{'is-active': currentUser == index}" class="list-group-item d-flex border-left-0 border-right-0 rounded-0" v-for="(conversation, index) in conversations" :index="index" @click="currentUser = index">
							<img :src="conversation.profilePicUrl" class="rounded-circle mr-3 p-0 img-fluid img-thumbnail" alt="Profile Picture">
							<div class="d-flex flex-wrap" @click="currentUser = index">
								<span class="w-100">{{conversation.user}}</span>
								<small class="border px-2 text-wrap">{{conversation.position}}</small>
							</div>
							<a aria-hidden="true" class="chevron right ml-auto add-btn btn btn-link" href="javascript:void(0)"></a>
							<img src="./images/trash.svg" class="delete-chat position-absolute" alt="Trash" @click.stop="deleteConversation(conversation, index)">
						</li>
					</ul>
					
				</aside>

				<transition name="slide-fade">

					<div class="wrap-conversation d-flex flex-grow-1 p-4 flex-column" v-if="currentUser !== ''">

						<div class="inner w-100" :class="{'no-data': conversations[currentUser].messages.length < 1}">

							<div class="border-bottom pb-4 mb-3 top-bar-messages-smartphone">
								<div class="d-flex align-items-center" @click="currentUser = ''"><span class="chevron left"></span>Back</div>
								<div class="ml-auto d-flex">
									<img :src="conversations[currentUser].profilePicUrl" class="rounded-circle mr-3 p-0 img-fluid img-thumbnail" alt="Profile Picture">
									<div class="d-flex flex-column justify-content-center">
										<span class="w-100">{{conversations[currentUser].user}}</span>
									</div>
								</div>
							</div>

							<template v-if="conversations[currentUser].messages.length > 0">

								<div class="card text-white bg-primary mb-4" :class="{'myself ml-auto border-0 text-reset': message.isMe}" v-for="(message, index) in conversations[currentUser].messages" :index="index">
									<div class="card-body">
										<small>{{message.time}}</small>
										<p class="card-text">{{message.text}}</p>
									</div>
								</div>
							
								<img v-if="preloader" src="./images/preloader.gif" class="preloader" alt="Preloader">

							</template>

							<template v-else>
								<div class="d-flex justify-content-center align-items-center h-100 flex-column">
									<img src="./images/box.svg" alt="No messages yet" class="mb-3">
									<span class="caption text-center">There are no messages with <i>{{conversations[currentUser].user}}</i> </span>
								</div>
							</template>

						</div>

					</div>

				</transition>

			</main>

			<div v-if="status == 0 || status == 2" class="add-user text-center m-auto position-absolute" :class="{corner: status == 2}">
				<button type="button" @click="status = 1" class="btn btn-primary rounded-circle mb-4 p-0">&#43;</button>
				<h2>Add Chat</h2>
			</div>

			<transition name="slide-fade-up">
			
				<div class="jumbotron px-4 py-0 m-0 position-absolute rounded-0 border-top bg-light d-flex align-items-end flex-column justify-content-center" v-if="currentUser !== ''">
					<form class="w-100">
						<div class="form-row">
							<div class="form-group mb-0 col">
								<label for="message" class="sr-only">Message</label>
								<input type="text" class="form-control" id="message" v-model="inputValue" placeholder="Type a Message" ref="contentField">
							</div>
							<div class="col-2 fixed-min-width">
								<button type="submit" mb-0 class="btn btn-primary w-100" :class="{'disabled': inputValue == ''}" @click.prevent="printMessage()">Send</button>
							</div>
						</div>
					</form>	
				</div>

			</transition>

		</div>
	
	`,
    el: '#app',
    data: {
		inputValue: '',
		preloader: false,
		userList: [],
		conversations: [],
		currentUser: '',
		status: 0
	},

	methods: {
		scrollDown() {
			let el = document.querySelector('.inner');
			el.parentElement.scrollTo(0, el.clientHeight);
		},
		addUser(user, index) {
			function messages(user) {
				if(typeof user['messages'] === 'undefined') {
					return []
				} else {
					return user.messages
				}
			}
			this.conversations.push({
				id: user._id,
				user: user.name,
				position: user.position,
				profilePicUrl: user.profilePicUrl,
				messages: messages(user),
			})

			// clean status
			this.status = 2;

			if(window.innerWidth > 700) {

				// set the selection on the last added user
				this.currentUser = this.conversations.length - 1;

			}

			// mark already added
			Vue.set(this.userList[index], 'added', true);

		},
		goToConversation(user) {
			const goTo = this.conversations.filter((el, index) => {
				if (el.id == user._id) {
					this.currentUser = index;
				};
			});

			// clean status
			this.status = 2;
		},
		closePopup() {
			if(this.conversations.length > 0) {
				this.status = 2;
			} else {
				this.status = 0;
			}
		},
		printUserList() {
			// API call
			axios
			.get('https://api.myjson.com/bins/1fl9j4')
			.then((response) => {
				this.userList = response.data;
			});
		},
		printMessage() {
			if(this.inputValue != '') {
				
				const tmpFieldValue = this.inputValue;

				this.conversations[this.currentUser].messages.push({
					text: tmpFieldValue,
					time: this.getDate(),
					isMe: true
				});

				this.inputValue = '';
				
				// storing current user in a tmpVar to prevent the reply being printed on a different
				// conversation if switching conversation during the time waiting of the answer
				const nowCurrentUser = this.currentUser;

				// delay simulation
				setTimeout(() => {
					// pass the value to the AI
					this.ai(tmpFieldValue, nowCurrentUser);
				},2000);

				// scroll down
				this.$nextTick(() => {
					this.scrollDown();
				});

			} else {
				return false;
			}
		},
		deleteConversation(conversation, index) {
			// deleting conversation
			this.conversations.splice(index, 1);

			// unmark selected users on the user list
			this.userList.forEach((user, index) => {
				if(user._id == conversation.id) {
					Vue.set(this.userList[index], 'added', false);
				}
			})

			if(this.conversations.length > 0) {
				
				// moving the selected user to the first user in the existing conversations
				this.currentUser = 0;

			} else {
				// if there are no existing conversations, restore first screen
				this.currentUser = '';
				this.status = 0;
			}

			// if I am on the smartphone mode
			if(window.innerWidth <= 700) {

				this.currentUser = '';

			}
		},
		ai(value, nowCurrentUser) {

			this.preloader = true;

			// calling AI
			axios({
				method: 'POST',
				url: 'https://api.dialogflow.com/v1/query?v=20150910',
				headers: {
					'Authorization': 'Bearer ad7829588896432caa8940a291b66f84',
					'Content-Type': 'application/json',
				},
				data: {
					"lang": "en",
					"query": value,
					"sessionId": "12345",
					"timezone": "Europe/Madrid"
				}
			})  
			.then((response) => {

				// delay simulation
				setTimeout(() => {

					this.conversations[nowCurrentUser].messages.push({
						text: response.data.result.fulfillment.speech,
						time: this.getDate(),
						isMe: false
					});

					this.preloader = false;

					// scroll down
					this.$nextTick(() => {
						this.scrollDown();
					});

				},3000);

			})
			.catch((error) => {
				console.log(error);                
			})
},
		getDate() {
			let current_datetime = new Date();
			let formatted_date = 	current_datetime.getFullYear() + "-" + 
									(current_datetime.getMonth() + 1) + "-" + 
									current_datetime.getDate() + " " + 
									current_datetime.getHours() + ":" + 
									current_datetime.getMinutes()
			return formatted_date;
		}
	},
	created() {
		this.printUserList();
	}
})
  