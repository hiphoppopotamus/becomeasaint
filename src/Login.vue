<template>
    <div class="background">
        <div id="registerPage" v-if="!userId">
            <WebsiteHeader/>
            <header>
                <br>
                <h1 class="words">Welcome back fellow Saint!</h1>
                <h3 class="words">How is life as a living god?</h3>
                <br>
            </header>

            <b-form id="registerForm" @submit="onSubmit">
                <b-form-group
                        id="emailId"
                        label="Email address:"
                        label-for="input-2"
                        class="words"
                >
                    <b-form-input
                            id="input-2"
                            v-model="loginForm.email"
                            type="email"
                            required
                            placeholder="Enter email"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        id="passwordId"
                        label="Password:"
                        label-for="input-3"
                        class="words"
                >
                    <b-form-input
                            id="input-3"
                            v-model="loginForm.password"
                            type="password"
                            required
                            placeholder="Enter password"
                    ></b-form-input>
                </b-form-group>
                <div id="buttons">
                    <b-button type="submit" variant="primary">Login</b-button>
                    <b-button @click="routeToRegister" variant="primary">Register</b-button>
                </div>
                <br>
                <br>
                <b-alert v-model="showDismissibleAlert" variant="danger" dismissible>
                    Invalid email/password combination!
                </b-alert>
            </b-form>
        </div>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
    </div>
</template>

<script>

    export default {
        data() {
            return {
                userId: sessionStorage.getItem("id"),
                loginForm: {
                    email: '',
                    password: '',
                },
                showDismissibleAlert: false,
            }
        },
        created() {
            if (this.userId) {
                this.$router.push({
                    name: 'profile',
                    params:
                        {
                            userId: sessionStorage.getItem("id")
                        },
                });
            }
        },
        methods: {
            onSubmit(evt) {
                evt.preventDefault();
                this.showDismissibleAlert = false;
                let jsonForm = this.loginForm;
                this.$http.post('http://localhost:4941/api/v1/users/login',
                    jsonForm
                ).then((response) => {
                    sessionStorage.setItem("id", response.data.userId);
                    sessionStorage.setItem("token", response.data.token);
                    this.$router.push({ name: 'profile', params: { userId: response.data.userId }});
                }).catch(error => {
                    if (error.response.status === 400) {
                        this.showDismissibleAlert = true;
                        console.log(error.response.statusText)
                    }
                })
            },
            routeToRegister() {
                this.$router.push({ name: 'register'});
            }
        }
    }
</script>

<style scoped>
    .background {
        background-image: url("protest.jpg");
        background-position: -40px;
        font-family: Futura,sans-serif;
    }

    .background button {
        width: 100px;
        border-radius: 16px;
    }

    #buttons {
        padding-top: 0px;
        /*width: 50%;*/
        /*margin-left: 34%;*/
    }

    .words {
        color: white;
        text-shadow: 0 0 3px dimgrey, 0 0 5px dimgrey;
    }

    #registerPage {
        margin: 5% 8%;
    }

    #registerPage header {
        text-align: center;
    }

    #registerForm {
        margin: 0 20%;
    }
</style>