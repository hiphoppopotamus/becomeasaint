<template>
    <div class="background">
        <div id="editProfilePage" v-if="visible">
            <WebsiteHeader/>
            <h2 id="subtitle">Personalize your profile.<br>
                With the smooth sounds of daybreak.</h2>
            <br>
            <b-form id="editProfileForm" @submit="onSubmit">
                <b-form-group
                        id="imageId"
                >
                    <img v-if="url"
                         :src="url"
                         alt="Author avatar"
                         class="avatar">
                    <img v-else
                         @error="showDefaultImg($event)"
                         :src=this.image
                         alt="Author avatar"
                         class="avatar">
                    <br>

                    <b-form-file v-model="selectedImage"
                                 @input="validateImageType"
                                 @change="onFileChange"
                                 ref="file-input" class="mb-2"></b-form-file>
                </b-form-group>

                <table>
                    <tr>
                        <td>
                            <p class="words" id="types">Types accepted: jpeg, png, gif</p>
                        </td>
                        <td>
                            <b-button @click="clearFiles" class="mr-2">Revert changes</b-button>
                        </td>
                        <td id="resetButton">
                            <b-button variant="danger" @click="clearImage" class="mr-2">Remove image</b-button>
                        </td>
                    </tr>
                </table>
                <br>
                <b-alert v-model="showDismissibleAlertType" variant="danger" dismissible>
                    Invalid image type!
                </b-alert>


                <b-form-group
                        id="nameId"
                        label="Name:"
                        label-for="name"
                        required
                >
                    <b-form-input
                            id="name"
                            :value=this.name
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                        id="emailId"
                        label="Email address:"
                        label-for="email"
                >
                    <b-form-input
                            id="email"
                            type="email"
                            :value=this.email
                            required
                    ></b-form-input>
                </b-form-group>

                <b-alert v-model="showDismissibleEmailAlert" variant="danger" dismissible>
                    {{ this.enteredEmail }} is already in use!
                </b-alert>

                <b-form-group
                        id="currentPasswordId"
                        label="Current password:"
                        label-for="currentPassword"
                >
                    <b-form-input
                            id="currentPassword"
                            type="password"
                            v-model="currentPassword"
                    ></b-form-input>
                </b-form-group>

                <b-alert v-model="showDismissiblePasswordAlert" variant="danger" dismissible>
                    Incorrect password, please try again
                </b-alert>

                <b-form-group
                        id="newPasswordId"
                        label="New password:"
                        label-for="newPassword"
                >
                    <b-form-input
                            id="newPassword"
                            type="password"
                            v-model="newPassword"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        id="cityId"
                        label="City:"
                        label-for="city"
                >
                    <b-form-input
                            id="city"
                            :value=this.city
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        id="countryId"
                        label="Country:"
                        label-for="country"
                >
                    <b-form-input
                            id="country"
                            :value=this.country
                    ></b-form-input>
                </b-form-group>
                <b-button type="submit" variant="primary">Save Profile</b-button>
                <b-button @click="routeToProfile">Back To Profile</b-button>
            </b-form>
        </div>
        <br>
        <br>
    </div>
</template>

<script>
    export default {
        isLoggedIn: false,
        name: "EditProfile.vue",
        data() {
            return {
                user: null,
                userId: null,
                name: null,
                email: null,
                city: null,
                country: null,

                currentPassword: null,
                newPassword: null,

                image: null,
                selectedImage: null,
                url: null,

                editAndUpload: false,

                showDismissibleEmailAlert: false,
                showDismissiblePasswordAlert: false,
                enteredEmail: null,
                showDismissibleAlertType: null,

                isLoggedIn : sessionStorage.getItem("token") !== null,
                visible: null,
                audio: null
            }
        },
        mounted() {
            this.playSound('https://docs.google.com/uc?export=download&id=10gUOr7amhBOmvFISVtHtgqX-BpaRWhXa');
            this.userId = this.$route.params.userId;
            this.getUser(this.userId);
        },
        beforeDestroy() {
            this.stopAudio();
        },
        watch: {
            isLoggedIn: function () {
                this.setIsLoggedIn();
            }
        },
        methods: {
            playSound(sound) {
                if(sound) {
                    this.audio = new Audio(sound);
                    this.audio.play();
                    this.audio.volume = 0.4;
                }
            },
            stopAudio() {
                this.audio.pause();
            },
            setIsLoggedIn: function() {
                this.isLoggedIn = (sessionStorage.getItem("token") !== null);
            },
            async logout() {
                this.$http.post(`http://localhost:4941/api/v1/users/logout`,
                    null,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token"),
                        }
                    }
                ).then(response => {
                    sessionStorage.clear()
                    this.$router.push({
                        name: 'login'
                    });
                })
            },
            getUser(userId) {
                this.$http.get('http://localhost:4941/api/v1/users/' + userId,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }).then((response) => {
                        console.log(response.data)
                        if (!response.data["email"]) {
                            console.log(1)
                            this.visible = false;
                            if (sessionStorage.getItem("id") && (sessionStorage.getItem("id") !== this.userId)) {
                                console.log(2)
                                this.redirectToOwnPage();
                            } else {
                                console.log(3)
                                this.redirectToLogin();
                            }
                        } else {
                            this.visible = true;
                            this.user = response.data;
                            this.name = this.user.name;
                            this.email = this.user.email;
                            this.city = this.user.city;
                            this.country = this.user.country;

                            this.image = "http://localhost:4941/api/v1/users/" + sessionStorage.getItem("id") + "/photo";
                            this.originalImage = "http://localhost:4941/api/v1/users/" + sessionStorage.getItem("id") + "/photo";
                        }
                    }).catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                        if (sessionStorage.getItem("token")) {
                            this.redirectToOwnPage();
                        } else {
                            this.redirectToLogin();
                        }
                    });
            },

            onSubmit(evt) {
                this.showDismissibleEmailAlert = false;
                this.showDismissiblePasswordAlert = false;
                evt.preventDefault();
                let editProfileForm = {};
                if (this.name !== document.getElementById("name").value.trim()) {
                    editProfileForm['name'] = document.getElementById("name").value.trim();
                }

                if (this.email !== document.getElementById("email").value.trim()) {
                    editProfileForm['email'] = document.getElementById("email").value.trim();
                }

                if (this.city) {
                    if (document.getElementById("city").value.trim() === "") {
                        this.city = null
                    } else if (this.city !== document.getElementById("city").value.trim()) {
                        editProfileForm['city'] = document.getElementById("city").value.trim();
                    }
                }
                if (this.city === null) {
                    if (document.getElementById("city").value.trim() !== "") {
                        editProfileForm['city'] = document.getElementById("city").value.trim();
                    }
                }

                if (this.country) {
                    if (document.getElementById("country").value.trim() === "") {
                        this.country = null
                    } else if (this.country !== document.getElementById("country").value.trim()) {
                        editProfileForm['country'] = document.getElementById("country").value.trim();
                    }
                }
                if (this.country === null) {
                    if (document.getElementById("country").value.trim() !== "") {
                        editProfileForm['country'] = document.getElementById("country").value.trim();
                    }
                }

                if ((this.currentPassword && this.newPassword) &&
                    (this.currentPassword.trim() !== "" && this.newPassword.trim() !== "")) {
                    editProfileForm['currentPassword'] = this.currentPassword.trim();
                    editProfileForm['password'] = this.newPassword.trim();
                }

                // If no edit profile form but provides photo
                if (this.isEmptyObject(editProfileForm) && this.selectedImage) {
                    if (this.selectedImage.length === 0) {
                        this.deleteImage();
                    } else {
                        this.uploadImage();
                    }
                // If edit profile form but no photo
                } else if (!this.isEmptyObject(editProfileForm) && !this.selectedImage) {
                    this.editProfile(editProfileForm)
                } else if (!this.isEmptyObject(editProfileForm) && this.selectedImage) {
                    this.editAndUpload = true;
                    this.editProfile(editProfileForm);
                }

                if (this.isEmptyObject(editProfileForm) && !this.selectedImage) {
                    this.routeToProfile();
                }
            },

            editProfile(editProfileForm) {
                this.$http.patch(`http://localhost:4941/api/v1/users/${sessionStorage.getItem('id')}`,
                    editProfileForm,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }).then((response) => {
                        if (this.editAndUpload) {
                            if (this.selectedImage.length === 0) {
                                this.deleteImage();
                            } else {
                                this.uploadImage();
                            }
                        } else {
                            this.routeToProfile();
                        }
                    }).catch((error) => {
                        this.enteredEmail = document.getElementById("email").value.trim();
                        if (error.response.status === 400) {
                            if (error.response.statusText === "Bad Request: email already in use") {
                                this.showDismissibleEmailAlert = true;
                            }
                            if (error.response.statusText === "Bad Request: incorrect password") {
                                this.showDismissiblePasswordAlert = true;
                            }
                        }
                    }

                )
            },
            uploadImage() {
                this.$http.put(`http://localhost:4941/api/v1/users/${sessionStorage.getItem('id')}/photo`,
                    this.selectedImage,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token"),
                            "content-type": this.selectedImage.type
                        },
                    }
                ).then(response => {
                    this.routeToProfile();
                })
            },
            deleteImage() {
                this.$http.delete(`http://localhost:4941/api/v1/users/${sessionStorage.getItem('id')}/photo`,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token"),
                            "content-type": this.selectedImage.type
                        },
                    }).then(response => {
                        this.routeToProfile();
                    }).catch(error => {
                        this.routeToProfile();
                        }
                    )
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
            routeToProfile() {
                this.stopAudio();
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
                this.selectedImage = null;
                this.url = null;
                this.image = this.originalImage;
            },
            clearImage() {
                this.clearFiles();
                this.image = "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png";
                this.selectedImage = [];
            },
            onFileChange(e) {
                this.selectedImage = e.target.files[0];
                this.url = URL.createObjectURL(this.selectedImage);
            },
            showDefaultImg(event) {
                event.target.src = "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png";
            },
            isEmptyObject(obj){
                return JSON.stringify(obj) === '{}';
            },
            redirectToLogin() {
                sessionStorage.clear();
                this.$router.push({
                    name: 'login'
                });
            },
            redirectToOwnPage() {
                this.$router.push({
                    name: 'editProfile',
                    params:
                        {
                            userId: sessionStorage.getItem("id")
                        },
                });
                this.userId = sessionStorage.getItem("id");
                this.getUser(this.userId);
            }
        }
    }
</script>

<style scoped>
    #editProfilePage {
        margin: 5% 8%;
    }

    #editProfileForm {
        margin: 0 20%;
    }

    .background {
        font-family: Futura,sans-serif;
        background-color: floralwhite;
        background-position: -40px;
        background-repeat: repeat-y;
    }

    /*#imageId {*/
    /*    display: block;*/
    /*    margin-left: auto;*/
    /*    margin-right: auto;*/
    /*    width: 50%*/
    /*}*/

    .avatar {
        vertical-align: middle;
        width: 400px;
        height: auto;
        border-radius: 100%;
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    button {
        width: 170px;
        border-radius: 16px;
    }

    #imageId {
        padding-bottom: 0px;
    }

    #resetButton button {
        width: 100%;
    }

    #types {
        margin-top: 0;
        padding-top: 8px;
    }

    table {
        padding-top: 0;
        width: 100%
    }

    #subtitle {
        text-align: center;
    }
</style>