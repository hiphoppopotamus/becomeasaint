<template>
    <div class="background">
        <div id="pp">
            <div id="profilePage" v-if="visible">
                <WebsiteHeader/>
                <header>
                    <h1>Profile Overview</h1>
                    <h6>You spicy ragamuffin!</h6>
                </header>
                <br>
                <br>
                <div id="card">
                    <b-card :title=this.name
                            :img-src="this.image"

                            img-alt="user image"
                            img-left
                            img-height="auto"
                            img-width="400"

                            class="mb-3"
                            style="max-width: 100%;"
                            border-variant="light"
                            header=" "
                            header-bg-variant="light"
                            transparent
                            bg=""
                    >
                        <b-card-text>
                            <div id="authorDetails">
                                <h6> Email: {{ this.email }} </h6>
                                <div v-if="this.city">
                                    <h6> City: {{ this.city }} </h6>
                                </div>
                                <div v-if="this.country">
                                    <h6> Country: {{ this.country }} </h6>
                                </div>
                            </div>
                        </b-card-text>
                        <div class="card-body">
                            <div>
                                <router-link :to="{ name: 'editProfile',params: { userId: this.userId } }">
                                    <b-button id="editButton" variant="dark">Edit Profile</b-button>
                                </router-link>
                                <b-button @click="goToCreatePetitions" variant="dark">Create Petition</b-button>
                                <b-button @click="logout" variant="dark">Log Out</b-button>
                            </div>
                        </div>
                    </b-card>
                </div>
            </div>
            <br>
        </div>
        <div id="petitions">
            <div v-if="petitions.length > 0" class="my-petitions">
                <br>
                <h4>Petitions you have started:</h4>
                <br>
                <div id="petitionsResults">
                    <b-table
                            striped hover
                            id="my-table"
                            :items="petitions"
                            :fields="fields"
                            @row-clicked="routeToOnePetition"
                    >
                        <template v-slot:cell(image)="data">
                            <span v-html="data.value"></span>
                        </template>
                    </b-table>
                </div>
            </div>
        </div>
        <br>
        <br>
        <br>
    </div>
</template>

<script>
    export default {
        name: "Profile",
        data() {
            return {
                user: null,
                userId: null,
                name: '',
                email: null,
                city: null,
                country: null,
                image: null,
                visible: null,
                petitions: [],
                fields: ['image', 'title', 'category', 'authorName', 'signatureCount']
            }
        },
        async mounted() {
            this.userId = this.$route.params.userId;
            await this.getUser(this.userId);
            sessionStorage.setItem("name", this.name.trim());
            await this.getImage();
            this.getPetitions();
        },
        methods: {
            async getImage() {
                await this.$http.get(`http://localhost:4941/api/v1/users/${sessionStorage.getItem("id")}/photo`,
                    ).then((response) => {
                    }).catch((error) => {
                    this.image = "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png"
                })
            },
            async getUser(userId) {
                await this.$http.get('http://localhost:4941/api/v1/users/' + userId,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }).then((response) => {
                    if (!response.data["email"]) {
                        this.visible = false;
                        if (sessionStorage.getItem("id") && (sessionStorage.getItem("id") !== this.userId)) {
                            this.redirectToOwnPage();
                        } else {
                            this.redirectToLogin();
                        }
                    } else {
                        this.visible = true;
                        this.user = response.data;
                        this.name = this.user.name;
                        this.email = this.user.email;
                        this.city = this.user.city;
                        this.country = this.user.country;
                        console.log("picture")
                        this.image = "http://localhost:4941/api/v1/users/" + sessionStorage.getItem("id") + "/photo";
                    }
                }).catch((error) => {
                    this.error = error;
                    this.errorFlag = true;
                    if (sessionStorage.getItem("id") && sessionStorage.getItem("token")) {
                        this.redirectToOwnPage();
                    } else {
                        this.redirectToLogin();
                    }
                });
            },

            getPetitions: function() {
                this.$http.get('http://localhost:4941/api/v1/petitions')
                    .then((response) => {
                        const petitions = response.data;
                        for (let i in petitions) {
                            if (this.name === petitions[i].authorName) {
                                this.petitions.push(
                                    {
                                        "id": petitions[i].petitionId,
                                        "image":
                                            '<img src=http://localhost:4941/api/v1/petitions/' + petitions[i].petitionId + '/photo' +
                                            ' width="200">',
                                        "title": petitions[i].title,
                                        "category": petitions[i].category,
                                        "authorName": petitions[i].authorName,
                                        "signatureCount": petitions[i].signatureCount,
                                    }
                                );
                            }
                        }
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            routeToOnePetition: function(record) {
                this.$router.push({ name: 'petition', params: { petitionId: record.id }});
            },
            logout() {
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

            redirectToLogin() {
                sessionStorage.clear();
                this.$router.push({
                    name: 'login'
                });
            },

            redirectToOwnPage() {
                this.$router.push({
                    name: 'profile',
                    params:
                        {
                            userId: sessionStorage.getItem("id")
                        },
                });
                this.userId = sessionStorage.getItem("id");
                this.getUser(this.userId);
            },

            goToCreatePetitions() {
                this.$router.push({
                    name: 'createPetition'
                });
            }
        }
    }

</script>

<style scoped>
    header {
        /*color: burlywood;*/
        /*text-shadow: 0 0 3px dimgrey, 0 0 5px black;*/
        text-align: center;
    }

    #profilePage {
        margin: 5% 8% 2%;
    }

    #pp {
        /*background-image: url("../camtony.jpg");*/
        background-position: -40px;
    }

    #petitions {
        padding-top: 0;
        margin: 0 8%;
        /*color: burlywood;*/
    }

    #petitions h4 {
    }

    .background {
        font-family: Futura,sans-serif;
        background-color: floralwhite;
        background-position: -40px;
        background-repeat: repeat-y;
    }

    #card {
        padding-left: 4%;
        padding-right: 4%;
    }

    .card-body {
        height: 100%;
        float: bottom;
    }

    button {
        width: 140px;
        border-radius: 16px;
    }
</style>