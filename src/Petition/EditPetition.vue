<template>
    <div class="background">
        <div class="editPetitionPage" v-if="visible">
            <WebsiteHeader/>
            <h2 class="subtitle">Edit your own petition.<br>
                Be the starlight of your universe.</h2>
            <br>
            <b-form id="editPetitionForm" @submit="onSubmit">
                <b-form-group
                        id="imageId"
                >
                    <img v-if="url"
                         :src="url"
                         alt="Hero Image"
                         class="heroImage">
                    <img v-else
                         :src=this.heroImage
                         alt="Hero Image"
                         class="heroImage">

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
                        <td id="resetButton">
                            <b-button @click="clearFiles" class="mr-2">Reset selection</b-button>
                        </td>
                    </tr>
                </table>
                <br>
                <b-alert v-model="showDismissibleAlertType" variant="danger" dismissible>
                    Invalid image type!
                </b-alert>



                <b-form-group
                        id="titleId"
                        label="Title:"
                        label-for="title"
                        required
                >
                    <b-form-input
                            id="title"
                            :value=this.editPetitionForm.title
                            v-model="editPetitionForm.title"
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                        id="descriptionId"
                        label="Description:"
                >
                    <b-form-textarea
                            :value="this.editPetitionForm.description"
                            rows="3"
                            max-rows="8"
                            v-model="editPetitionForm.description"
                            required
                    ></b-form-textarea>
                </b-form-group>

                <b-form-group
                        id="categoryId"
                        label="Choose a Category:"
                >
                    <b-form-select
                            v-model="editPetitionForm.categoryId"
                            :options="categories"
                            required
                    ></b-form-select>
                </b-form-group>


                <b-form-group>
                    <label for="closingDateId">Closing Date:</label>
                    <b-form-datepicker v-model="closingDate"
                                       :disabled="this.alreadyClosed"
                                       id="closingDateId"
                                       :reset-value="originalClosingDate ? originalClosingDate : null"
                                       reset-button
                                       close-button
                                       placeholder="Choose a date:"
                                       :min="min"
                                       locale="en">
                    </b-form-datepicker>
                    <p id="isAlreadyClosed" v-if="this.alreadyClosed">
                        This petition has already closed.
                    </p>
                </b-form-group>
                <b-button type="submit" variant="primary">Save Petition</b-button>
                <b-button @click="routeToPetition">Back To Petition</b-button>
            </b-form>
        </div>
        <div class="editPetitionPage" v-else-if="visible === false">
            <WebsiteHeader/>
            <br>
            <br>
            <br>
            <br>
            <h2 class="subtitle">You can only edit your own petition you silly caboose!</h2>
            <br>
            <h4 class="subtitle">The gravy train is leaving the station and redirecting you to our available petitions!</h4>
            <h2 class="subtitle"><br><br>Choo choo woof woof choo choo little doggy!</h2>
            <br>
        </div>
        <br> <br>
        <br>
        <br>
        <br>
        <br>
    </div>
</template>

<script>
    export default {
        name: "EditPetition",
        data() {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const tomorrow = today.setDate(today.getDate() + 1);

            // 15th two months prior
            const minDate = new Date(tomorrow);
            return {
                editPetitionForm: {
                    title: '',
                    description: '',
                    categoryId: null,
                },

                originalTitle: null,
                originalDescription: null,
                originalCategory: null,

                categoryName: null,
                categories: [
                    { value: null, text: 'Please select an option' },
                ],

                heroImage: null,
                selectedImage: null,
                url: null,

                min: minDate,
                closingDate: null,
                originalClosingDate: null,
                alreadyClosed: false,
                showDismissibleAlertType: null,

                authorId: null,
                myId: sessionStorage.getItem("id"),
                visible: null
            }
        },
        async created() {
            await this.getPetition(this.$route.params.petitionId);
            if (this.myId.toString() === this.authorId.toString()) {
                this.visible = true;
            } else {
                this.visible = false;
                setTimeout(() => {
                    this.$router.push({ name: 'petitions' })
                }, 6000);
                return;
            }
            this.getCategories();
        },
        methods: {
            async getPetition(petitionId) {
                await this.$http.get('http://localhost:4941/api/v1/petitions/' + petitionId)
                    .then((response) => {
                        this.editPetitionForm.title = response.data.title;
                        this.editPetitionForm.description = response.data.description;
                        this.categoryName = response.data.category;

                        this.authorId = response.data.authorId;
                        this.originalTitle = response.data.title;
                        this.originalDescription = response.data.description;

                        this.originalClosingDate = response.data.closingDate;
                        this.closingDate = response.data.closingDate;
                        this.checkIfPetitionIsClosed();

                        this.heroImage = "http://localhost:4941/api/v1/petitions/" + this.$route.params.petitionId + "/photo"
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            getCategories() {
                this.$http.get('http://localhost:4941/api/v1/petitions/categories')
                    .then((response) => {
                        let categories = response.data;
                        for (let i in categories) {
                            if (categories[i].name === this.categoryName) {
                                this.editPetitionForm.categoryId = categories[i].categoryId;
                                this.originalCategory = categories[i].categoryId;
                            }
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
                if (this.editPetitionForm.title === this.originalTitle) {
                    delete this.editPetitionForm.title
                }
                if (this.editPetitionForm.description === this.originalDescription) {
                    delete this.editPetitionForm.description
                }

                if (this.editPetitionForm.categoryId === this.originalCategory) {
                    delete this.editPetitionForm.categoryId
                }

                if (this.originalClosingDate === null && this.closingDate !== null) {
                    this.editPetitionForm['closingDate'] = this.closingDate;
                } else if (this.convertToDate(this.originalClosingDate) !== this.convertToDate(this.closingDate)) {
                    this.editPetitionForm['closingDate'] = this.closingDate;
                }

                if (this.isEmptyObject(this.editPetitionForm) === true && this.selectedImage === null) {
                    console.log('alert')
                }

                if (this.isEmptyObject(this.editPetitionForm) === false) {
                    await this.editPetition()
                }

                if (this.selectedImage !== null) {
                    await this.uploadImage()
                }
                this.routeToPetition();
            },
            async editPetition() {
                await this.$http.patch(`http://localhost:4941/api/v1/petitions/${this.$route.params.petitionId}`,
                    this.editPetitionForm,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token")
                        },
                    }
                ).then((response) => {
                    console.log(response);
                }).catch((error) => {

                })
            },
            async uploadImage() {
                await this.$http.put(`http://localhost:4941/api/v1/petitions/${this.$route.params.petitionId}/photo`,
                    this.selectedImage,
                    {
                        headers: {
                            "X-Authorization": sessionStorage.getItem("token"),
                            "content-type": this.selectedImage.type
                        },
                    }
                ).then((response) => {
                    console.log(response)
                }).catch((error) => {

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
            clearFiles() {
                this.$refs['file-input'].reset()
                this.selectedImage = null;
                this.url = null;
                this.image = this.originalImage;
            },
            onFileChange(e) {
                this.selectedImage = e.target.files[0];
                this.url = URL.createObjectURL(this.selectedImage);
            },
            routeToPetition() {
                this.$router.push({
                    name: 'petition',
                    params:
                        {
                            petitionId: this.$route.params.petitionId
                        },
                });
            },
            convertToDate: function(date) {
                return date.slice(0, 10);
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
            isEmptyObject(obj) {
                return JSON.stringify(obj) === '{}';
            }

        }
    }
</script>

<style scoped>
    .editPetitionPage {
        margin: 5% 8%;
    }

    #editPetitionForm {
        margin: 0 20%;
    }

    .subtitle {
        text-align: center;
    }

    .heroImage {
        alignment: center;
        vertical-align: middle;
        /*border-radius: 100%;*/
        margin-left: auto;
        margin-right: auto;
        width: 90%;
        margin-bottom: 22px;
        display: block;

    }


    #isAlreadyClosed {
        margin-top: 2%;
        color: indianred;
    }

    .background {
        font-family: Futura,sans-serif;
        background-color: floralwhite;
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
</style>