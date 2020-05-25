<template>
    <div class="background">
        <div id="registerPage">
            <WebsiteHeader/>
            <h2 id="subtitle" class="words">Own your profile.<br>
                Be the moonlight in their dreams.</h2>
            <br>
            <b-form id="registerForm" @submit="onSubmit" @reset="onReset" v-if="show">
                <b-form-group
                        class="words"
                        id="nameId"
                        label="Name:"
                        label-for="input-1"
                >
                    <b-form-input
                            id="input-1"
                            v-model="registrationForm.name"
                            required
                            placeholder="Enter name"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        class="words"
                        id="emailId"
                        label="Email address:"
                        label-for="input-2"
                >
                    <b-form-input
                            id="input-2"
                            v-model="registrationForm.email"
                            type="email"
                            required
                            placeholder="Enter email"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        class="words"
                        id="passwordId"
                        label="Password:"
                        label-for="input-3"
                >
                    <b-form-input
                            id="input-3"
                            v-model="registrationForm.password"
                            type="password"
                            required
                            placeholder="Enter password"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        class="words"
                        id="cityId"
                        label="City:"
                        label-for="input-4"
                >
                    <b-form-input
                            id="input-4"
                            v-model="registrationForm.city"
                            placeholder="Enter city"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        class="words"
                        id="countryId"
                        label="Country:"
                        label-for="input-5"
                >
                    <b-form-input
                            id="input-5"
                            v-model="registrationForm.country"
                            placeholder="Enter country"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        class="wordsImage"
                        id="imageId"
                        label="Image:"
                >
                    <b-form-file v-model="pictureFile" @input="validateImageType" ref="file-input" class="mb-2"></b-form-file>
                </b-form-group>
                <table>
                    <tr>
                        <td>
                            <p class="words" id="types">Types accepted: jpeg, png, gif</p>
                        </td>
                        <td id="resetButton">
                            <b-button @click="clearFiles" class="mr-2">Reset selection</b-button>
                        </td>
                    </tr>
                </table>
                <b-alert v-model="showDismissibleAlertType" variant="danger" dismissible>
                    Invalid image type!
                </b-alert>





                <p class="words" id="selectedFile">Selected file:
                    <b>{{ pictureFile ? pictureFile.name : 'None selected' }}</b>
                </p>
                <b-button type="submit" variant="primary">Submit</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
                <br>
                <br>
                <b-alert v-model="showDismissibleAlert" variant="danger" dismissible>
                    {{ this.registrationForm["email"] }} is already in use!
                </b-alert>
            </b-form>
        </div>
        <br>
        <br>
        <br>
    </div>


</template>

<script>
    export default {
        data() {
            return {
                registrationForm: {
                    name: '',
                    email: '',
                    password: '',
                },
                city: null,
                country: null,
                image: null,
                show: true,
                showDismissibleAlert: false,
                showDismissibleAlertType: false,
                pictureFile: null
            }
        },
        methods: {
            onSubmit(evt) {
                evt.preventDefault();
                this.showDismissibleAlert = false;
                if (typeof this.city === "string" && this.city.length > 0) {
                    this.registrationForm["city"] = this.city.trim()
                }
                if (typeof this.country === "string" && this.country.length > 0) {
                    this.registrationForm["country"] = this.country.trim()
                }
                let jsonForm = this.registrationForm;
                this.$http.post('http://localhost:4941/api/v1/users/register',
                    jsonForm
                ).then((response) => {
                    this.login();

                }).catch(error => {
                    if (error.response.status === 400 &&
                        error.response.statusText === "Bad Request: email already in use") {
                        this.showDismissibleAlert = true;
                        console.log(error.response.statusText)
                    }
                })
            },
            onReset(evt) {
                evt.preventDefault();
                // Reset our form values
                this.registrationForm.name = '';
                this.registrationForm.email = '';
                this.registrationForm.password = '';
                this.registrationForm.city = '';
                this.registrationForm.country = '';
                // Trick to reset/clear native browser form validation state
                this.show = false;
                this.pictureFile = null;
                this.clearFiles();
                this.$nextTick(() => {
                    this.show = true
                })
            },
            validateImageType(photo) {
                if (photo === null) {
                    return
                }
                let validTypes = ["image/jpeg", "image/png", "image/gif"];
                if (!validTypes.includes(photo.type)) {
                    this.showDismissibleAlertType = true;
                    this.clearFiles();
                } else {
                    this.showDismissibleAlertType = false;
                }
            },
            login() {
                this.$http.post(`http://localhost:4941/api/v1/users/login`,
                    {
                        "email": this.registrationForm['email'],
                        "password": this.registrationForm['password']
                    }
                ).then(response => {
                    sessionStorage.setItem("id", response.data.userId);
                    sessionStorage.setItem("token", response.data.token);
                    if (this.pictureFile) {
                        this.uploadImage(response.data.userId);
                    } else {
                        this.routeToProfile();
                    }
                })
            },
            uploadImage(userId) {
                this.$http.put(`http://localhost:4941/api/v1/users/${userId}/photo`,
                    this.pictureFile,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token"),
                            "content-type": this.pictureFile.type
                        },
                    }
                ).then(response => {
                    this.routeToProfile();
                })
            },
            routeToProfile() {
                this.$router.push({
                    name: 'profile',
                    params:
                        {
                            userId: sessionStorage.getItem("id")
                        },
                });
            },
            clearFiles() {
                this.$refs['file-input'].reset()
            },
        }
    }
</script>

<style scoped>
    .background {
        background-image: url("../milkyway.jpg");
        background-position: -40px;
        font-family: Futura,sans-serif;
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

    #subtitle {
        text-align: center;
    }

    .words {
        color: white;
        text-shadow: 0 0 3px dimgrey, 0 0 5px dimgrey;
    }

    .wordsImage {
        color: white;
    }

    #types {
        margin-top: 0;
        padding-top: 8px;
    }

    #selectedFile {
        padding-top: 2px;
    }

    #imageId {
        margin-bottom: 0;
        padding-bottom: 0;
    }

    table {
        width: 100%
    }

    #resetButton {
        float: right;
        padding-right: 0;
        margin-right: 0;
    }

    button {
        width: 100px;
        border-radius: 16px;
    }

    #resetButton button {
        width: 100%;
    }
    /*#nameId {*/
    /*    width: 50%;*/
    /*}*/

    /*#emailId {*/
    /*    width: 50%;*/
    /*}*/

    /*#passwordId {*/
    /*    width: 50%;*/
    /*}*/
</style>