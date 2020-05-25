<template>
    <div class="background">
        <div v-if="$route.params.petitionId" id="petitionPage">
            <WebsiteHeader/>
            <br>
            <br>
            <br>
            <div>
                <div id="petitionHeader">
                    <h1 class="font-weight"> {{ this.title }} </h1>
                </div>

                <div id="petitionCard">
                    <b-card
                            :img-src=this.heroImage
                            img-alt="Petition hero image"
                            img-left class="mb-3"
                            img-height="auto"
                            img-width="650"
                            ref="heroCardImage"
                    >
                        <b-card-text>
                            <h1> {{ this.signatureCount }} have signed. </h1>
                            <h2> {{ this.category }} </h2>
                        </b-card-text>
                        <br>
                        <b-card-text>
                            <h4> Start date:
                                <br> {{ convertToDate(this.createdDate) }}
                            </h4>
                            <br>
                            <h4> End date:
                                <br> {{ convertToDate(this.closingDate) }}
                            </h4>
                        </b-card-text>
                        <br>
                        <b-card-text>
                            <table>
                                <tr>
                                    <td>
                                        <img @error="showDefaultImg($event)"
                                             :src=this.authorImage
                                             alt="Author avatar"
                                             class="avatar">
                                    </td>
                                    <td id="petitionBy">
                                        <div> A Petition By:
                                            <h6> {{ this.authorName }} </h6>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </b-card-text>
                    </b-card>
                </div>


                <div id="petitionDescription">
                    <h2>Description:</h2>
                    <p> {{ this.description }} </p>
                </div>

                <div id="authorCard">
                    <b-card
                            :title=this.authorName
                            :img-src=this.authorImage
                            img-alt="authorImage"
                            img-top
                            tag="article"
                            style="max-width: 20rem;"
                            ref="authorCardImage"
                    >
                        <div id="authorDetails">
                            <div v-if="this.authorCity">
                                <h6> City: {{ this.authorCity }} </h6>
                            </div>
                            <div v-if="this.authorCountry">
                                <h6> Country: {{ this.authorCountry }} </h6>
                            </div>
                        </div>
                    </b-card>
                </div>
            </div>

            <div id="footer">
                <b-button v-b-toggle.collapse-1 variant="primary">Signatures</b-button>
                <b-button v-if="online && !signedUsers.includes(myId) && !alreadyClosed" @click="signPetition">Sign Petition</b-button>

                <b-button id="remove" v-if="!myPetition && online && signedUsers.includes(myId) && !alreadyClosed" @click="removeSignature">Remove my signature</b-button>

                <router-link v-if="isLoggedIn && !alreadyClosed" :to="{ name: 'editPetition', params: { petitionId: this.petitionId } }">
                    <b-button>Edit Petition</b-button>
                </router-link>
                <b-button v-if="isLoggedIn && !alreadyClosed" @click="deletePetition" >Delete</b-button>
                <a v-bind:href="`https://www.facebook.com/sharer/sharer.php?u=http://localhost:8080/petitions/${this.petitionId}`"
                   target="_blank"
                   rel="noopener"
                   class="fa fa-facebook"></a>
                <a v-bind:href="`https://twitter.com/share?url=http://localhost:8080/petitions/${this.petitionId}`"
                   class="fa fa-twitter"></a>
                <a v-bind:href="`mailto:?subject=I wanted you to see this site&amp;body=Check out this site http://localhost:8080/petitions/${this.petitionId}`"
                   title="Share by Email"
                   class="fa fa-envelope-square">
                </a>

                <b-collapse id="collapse-1" class="mt-2">
                    <b-card>
                        <b-table
                                striped hover
                                id="my-signatures-table"
                                :items="signatures"
                                :fields="signatureFields"
                        >
                            <template v-slot:cell(image)="data">
                                <img width="150" @error='showDefaultImg($event)' :src="data.item.image">
                            </template>
                        </b-table>
                    </b-card>
                </b-collapse>
            </div>
        </div>
        <br>
        <br>

    </div>
</template>

<script>
    export default {
        name: "petition",
        data() {
            return {
                petition: null,
                petitionId: null,
                title: "",
                description: "",
                signatureCount: "",
                category: "",
                authorId: null,
                authorName: "",
                authorCity: null,
                authorCountry: null,
                createdDate: "",
                closingDate: "",
                heroImage: null,
                authorImage: null,
                signatures: [],
                signatureFields: ['image', 'name', 'city', 'country', 'signedDate'],
                isLoggedIn: null,
                alreadyClosed: false,
                signedUsers: [],
                online: sessionStorage.getItem("token") !== null,
                myId: null,
                myPetition: null
            }
        },
        async mounted() {
            this.myId = sessionStorage.getItem("id");
            this.petitionId = this.$route.params.petitionId;
            await this.getPetition(this.petitionId);
            console.log(this.myId)
            console.log(this.authorId)
            this.myPetition = this.myId === this.authorId.toString();
            console.log(this.myPetition)

            // console.log(this.myPetition);
            await this.getImage();
            // this.$refs.heroCardImage.querySelector('img').onerror = this.handleImageError;
            this.getPetitionSignatures(this.petitionId);
        },
        methods: {
            async getImage() {
                await this.$http.get(`http://localhost:4941/api/v1/users/${this.authorId}/photo`,
                ).then((response) => {
                    console.log(response)
                    console.log("hey")
                }).catch((error) => {
                    console.log("whore")
                    this.authorImage = "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png"
                })
            },
            async getPetition(petitionId) {
                await this.$http.get('http://localhost:4941/api/v1/petitions/' + petitionId)
                    .then((response) => {
                        this.petition = response.data;
                        this.title =  this.petition.title;
                        this.description = this.petition.description;
                        this.signatureCount =  this.petition.signatureCount;
                        this.category =  this.petition.category;
                        this.authorId =  this.petition.authorId;
                        this.authorName =  this.petition.authorName;
                        this.authorCity =  this.petition.authorCity;
                        this.authorCountry =  this.petition.authorCountry;
                        this.createdDate =  this.petition.createdDate;
                        this.closingDate =  this.petition.closingDate;
                        this.checkIfPetitionIsClosed();
                        this.heroImage = "http://localhost:4941/api/v1/petitions/" + this.petition.petitionId + "/photo"
                        this.authorImage = "http://localhost:4941/api/v1/users/" + this.petition.authorId + "/photo";
                        this.isLoggedIn = this.authorId.toString() === sessionStorage.getItem("id");
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },

            getPetitionSignatures(petitionId) {
                this.$http.get('http://localhost:4941/api/v1/petitions/' + petitionId + '/signatures')
                    .then((response) => {
                        this.signatures = [];
                        const signatures = response.data;
                        this.signedUsers = [];
                        for (let i in signatures) {
                            this.signedUsers.push(signatures[i].signatoryId.toString());
                            let data = {
                                "id": signatures[i].signatoryId,
                                "name": signatures[i].name,
                                "image": "http://localhost:4941/api/v1/users/" + signatures[i].signatoryId + "/photo",
                                "city": signatures[i].city,
                                "country": signatures[i].country,
                                "signedDate": this.convertToDate(signatures[i].signedDate),
                            };
                            this.signatures.push(data);
                        }
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },

            checkIfPetitionIsClosed() {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                let closingDate = this.convertToDate(this.closingDate);
                let year = closingDate.slice(0, 4);
                let month = closingDate.slice(5, 7);
                let date = closingDate.slice(8, 10);
                const actualClosingDate = new Date(year, month-1, date);
                if (actualClosingDate < today) {
                    this.alreadyClosed = true;
                }
            },

            async deletePetition() {
                await this.$http.delete('http://localhost:4941/api/v1/petitions/' + this.$route.params.petitionId,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }
                ).then((response) => {
                    this.$router.push({ name: 'petitions'});
                })
            },

            convertToDate: function(date) {
                if (date === null) {
                    return "In progress"
                }
                return date.slice(0, 10);
            },

            showDefaultImg(event) {
                event.target.src = "https://www.kindpng.com/picc/m/451-4517876_default-profile-hd-png-download.png";
            },

            signPetition() {
                this.$http.post(`http://localhost:4941/api/v1/petitions/${this.$route.params.petitionId}/signatures`, null,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }
                ).then((response) => {
                    this.getPetitionSignatures(this.petitionId);
                })
            },
            removeSignature() {
                this.$http.delete(`http://localhost:4941/api/v1/petitions/${this.$route.params.petitionId}/signatures`,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }
                ).then((response) => {
                    this.getPetitionSignatures(this.petitionId);
                })
            }

            // handleImageError(event) {
            //     console.log('fuck')
            //     console.log(event);
            // }
        }
    }
</script>


<style scoped>
    body {
        background-color: #eeeeee;
        font-family: 'Open Sans', serif;
        font-size: 14px
    }

    .background {
        font-family: Futura,sans-serif;
        background-color: floralwhite;
    }

    .list-menu a {
        color: #343a40
    }

    a {
        text-decoration: none !important;
        background-color: transparent
    }

    .checkbox-btn input {
        position: absolute;
        z-index: -1;
        opacity: 0
    }

    .checkbox-btn input:checked~.btn {
        border-color: #3167eb;
        background-color: #3167eb;
        color: #fff
    }

    #petitionHeader {
        height: 100px;
        width: 100%;
        line-height: 400px;
        text-align: center;
    }

    .avatar {
        vertical-align: middle;
        width: 100px;
        border-radius: 100%;
    }

    #petitionBy {
        width: 232px;
        vertical-align: bottom;
    }

    #petitionBy div {
        margin-left: 8%;
    }

    #petitionDescription {
        margin: 5% 8%;
    }

    #petitionCard {
        margin: 0 8%
    }

    #authorCard {
        margin-top: 0;
        margin-right: 8%;
        margin-left: 8%;
    }

    #authorDetails {
        margin-top: 7%;
    }

    #footer {
        margin: 1% 8%
    }

    .fa {
        padding: 20px;
        font-size: 30px;
        width: 30px;
        text-align: center;
        text-decoration: none;
        border-radius: 50%;
    }

    header {
        margin: 5% 8%;
    }

    button {
        width: 120px;
        border-radius: 16px;
    }

    #remove {
        width: 200px;
    }

</style>
