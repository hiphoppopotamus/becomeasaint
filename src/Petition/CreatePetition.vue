<template>
    <div class="background">
        <div id="createPetitionPage" v-if="visible">
            <WebsiteHeader/>
            <h2 id="subtitle">Create your own petition.<br>
                Be the sunlight in a better world.</h2>
            <br>
            <b-form id="createPetitionForm" @submit="onSubmit">
                <b-form-group
                        id="titleId"
                        label="Title:"
                        label-for="input-1"
                >
                    <b-form-input
                            id="input-1"
                            v-model="createPetitionForm.title"
                            required
                            placeholder="Enter name"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        id="descriptionId"
                        label="Description:"
                >
                    <b-form-textarea
                            placeholder="Enter a sweet description for your dream petition"
                            rows="3"
                            max-rows="8"
                            v-model="createPetitionForm.description"
                            required
                    ></b-form-textarea>
                </b-form-group>

                <b-form-group
                        id="categoryId"
                        label="Choose a Category:"
                >
                    <b-form-select
                            v-model="createPetitionForm.categoryId"
                            :options="categories"
                            required
                    ></b-form-select>
                </b-form-group>

                <b-form-group>
                    <label for="closingDateId">Closing Date (Optional)</label>
                    <b-form-datepicker v-model="closingDate"
                                       id="closingDateId"
                                       reset-button
                                       close-button
                                       placeholder="Choose a date:"
                                       :min="min"
                                       locale="en"></b-form-datepicker>
                </b-form-group>

                <b-form-group
                        id="imageId"
                        label="Petition image:"
                >
                    <b-form-file v-model="pictureFile"
                                 @input="validateImageType"
                                 ref="file-input"
                                 required
                                 class="mb-2">
                    </b-form-file>
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
                <br>
                <b-alert v-model="showDismissibleAlertType" variant="danger" dismissible>
                    Invalid image type!
                </b-alert>

                <p class="mt-2">Selected file:
                    <b>{{ pictureFile ? pictureFile.name : 'None selected' }}</b>
                </p>

                <b-button type="submit" variant="primary">Submit</b-button>
            </b-form>
        </div>
        <br>
        <br>
        <br>
        </div>
</template>

<script>
    export default {
        isLoggedIn: false,
        name: "CreatePetition",
        data() {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = today.setDate(today.getDate() + 1);
            // 15th two months prior
            const minDate = new Date(tomorrow);
            return {
                userId: null,
                isLoggedIn : sessionStorage.getItem("token") !== null,
                petitionId: null,
                createPetitionForm: {
                    title: '',
                    description: '',
                    categoryId: null
                },
                pictureFile: null,
                categories: [
                    { value: null, text: 'Please select an option' },
                ],
                min: minDate,
                closingDate: null,
                // only show if sessionstorage has auth token if user is logged in
                visible: sessionStorage.getItem('token') !== null,
                showDismissibleAlertType: false
            }
        },
        mounted() {
            this.getCategories();
        },
        created() {
            this.userId = sessionStorage.getItem(`id`);
        },
        watch: {
            isLoggedIn: function () {
                this.setIsLoggedIn();
            }
        },
        methods: {
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
            getCategories() {
                this.$http.get('http://localhost:4941/api/v1/petitions/categories')
                    .then((response) => {
                        console.log(response.data);
                        let categories = response.data;
                        for (let i in categories) {
                            this.categories.push(
                                {
                                    value: categories[i].categoryId,
                                    text: categories[i].name
                                });
                        }
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            async onSubmit(evt) {
                evt.preventDefault();
                if (this.closingDate) {
                    this.createPetitionForm["closingDate"] = this.closingDate;
                } else {
                    delete this.createPetitionForm["closingDate"]
                }
                await this.createPetition();
                console.log(this.petitionId);
                if (this.pictureFile) {
                    await this.uploadImage();
                }
                await this.signPetition();
                this.routeToOnePetition();

            },
            async createPetition() {
                await this.$http.post(`http://localhost:4941/api/v1/petitions`,
                    this.createPetitionForm,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }
                ).then((response) => {
                    this.petitionId = response.data['petitionId']
                }).catch((error) => {

                })
            },
            async uploadImage() {
                await this.$http.put(`http://localhost:4941/api/v1/petitions/${this.petitionId}/photo`,
                    this.pictureFile,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token"),
                            "content-type": this.pictureFile.type
                        },
                    }
                ).then((response) => {
                    console.log(response)
                }).catch((error) => {

                })
            },
            async signPetition() {
                await this.$http.post(`http://localhost:4941/api/v1/petitions/${this.petitionId}/signatures`,
                    this.pictureFile,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }
                ).then((response) => {
                    console.log(response)
                }).catch((error) => {

                })
            },
            async routeToOnePetition() {
                this.$router.push({ name: 'petition', params: { petitionId: this.petitionId }});
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
            clearFiles() {
                this.$refs['file-input'].reset()
            },
        }
    }
</script>

<style scoped>
    #createPetitionPage {
        margin: 5% 8%;
    }

    #subtitle {
        text-align: center;
    }

    #createPetitionForm {
        margin: 0 20%;
    }

    button {
        width: 100px;
        border-radius: 16px;
    }


    .background {
        font-family: Futura,sans-serif;
        background-color: floralwhite;
    }

    table {
        width: 100%
    }


    #resetButton {
        float: right;
        padding-right: 0;
        margin-right: 0;
    }

</style>