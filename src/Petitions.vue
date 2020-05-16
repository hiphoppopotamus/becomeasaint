<template>
    <div v-if="$route.params.petitionId">
        <log>petitionId</log>
    </div>

    <div v-else>
        <header>
            <br>
            <h1>MAMABOND.com</h1>
            <h3>The Best Porn Site ever mama bond</h3>
        </header>


        <div>
            <b-input-group class="mt-3">
                <b-form-input placeholder="Search..." id="searchBox"></b-form-input>
                <b-input-group-append>
                    <b-button v-on:click="searchByTitle()" variant="info">
                        <b-icon-search></b-icon-search>
                    </b-button>
                </b-input-group-append>
            </b-input-group>
        </div>

        <div class="categoryFilter">
            <br><br>
            <header class="card-header">
                <h6>Categories</h6>
            </header>
            <br>
            <div class="card-body">
                <ul v-for="category in categories" class="list-menu">
                    <li><a href="#" v-on:click="filterByCategory(category.categoryId)"> {{ category.name }} </a></li>
                    <br>
                </ul>
            </div>
        </div>

        <div class="petitions-main">
            <div class="overflow-auto">
                <br>
                <div class="petitionsHeader">
                    <div class="pageElementCount">
                        <span class="results">
                            <span class="subset">
                                <b> {{ startPageSum }} </b> to <b> {{ endPageSum }} </b> of
                            </span>
                            <b class="total"> {{ rows }} </b>
                        </span>
                        <span class="results-label">Results</span>
                    </div>
                    <div>
                        <b-dropdown id="dropdown-1" variant="info" text="Sort By:" class="m-md-2">
                            <b-dropdown-item v-on:click="sortBy('SIGNATURES_DESC')">Number of signatures, most to least</b-dropdown-item>
                            <b-dropdown-item v-on:click="sortBy('SIGNATURES_ASC')">Number of signatures, least to most</b-dropdown-item>
                            <b-dropdown-item v-on:click="sortBy('ALPHABETICAL_ASC')">Alphabetically by title, A-Z</b-dropdown-item>
                            <b-dropdown-item v-on:click="sortBy('ALPHABETICAL_DESC')">Alphabetically by title, Z-A</b-dropdown-item>
                        </b-dropdown>
                        <b-button v-on:click="resetPetitions()" variant="info">
                            Reload Petitions <b-icon-arrow-repeat font-scale="1"></b-icon-arrow-repeat>
                        </b-button>
                    </div>
                </div>
                <div id="petitionsResults">

                    <b-table
                            striped hover
                            id="my-table"
                            :items="petitions"
                            :fields="fields"
                            :per-page="perPage"
                            :current-page="currentPage"
                            @row-clicked="getPetitionData"
                    >


<!--                        <span slot="id" slot-scope="data">-->
<!--                            <router-link :to="-->
<!--                                        {-->
<!--                                            name: 'user',-->
<!--                                          params: { userId : user.user_id }-->
<!--                                         }">-->
<!--                                <b-button>{{ data.value.description }}</b-button>-->
<!--                            </router-link>-->
<!--                        </span>-->

                        <template v-slot:cell(image)="data">
                            <span v-html="data.value"></span>
                        </template>

                    </b-table>

                    <b-pagination
                            v-model="currentPage"
                            :total-rows="rows"
                            :per-page="perPage"
                            aria-controls="my-table"
                    ></b-pagination>

                </div>
            </div>
        </div>



<!--        <div>-->
<!--            <b-card-group deck v-for="petition in petitions">-->

<!--                <b-card-->
<!--                        no-body-->
<!--                        style="max-width: 20rem;"-->
<!--                        img-src=`{{petition.image}}`-->
<!--                        img-alt="Image"-->
<!--                        img-top-->
<!--                >-->
<!--                    <template v-slot:header>-->
<!--                        <h4 class="mb-0"> {{ petition.title }} </h4>-->
<!--                    </template>-->

<!--                    <b-card-body>-->
<!--                        <b-card-title> {{ petition.category }} </b-card-title>-->
<!--                        <b-card-sub-title class="mb-2"> {{ petition.authorName }} </b-card-sub-title>-->
<!--                        <b-card-text>-->
<!--                            {{ petition.signatureCount }} Signatures-->
<!--                        </b-card-text>-->
<!--                    </b-card-body>-->
<!--                </b-card>-->
<!--            </b-card-group>-->
<!--        </div>-->


    </div>
</template>

<script>
    export default {
        data () {
            return {
                error: "",
                errorFlag: false,
                originalPetitions: [],
                petitions: [],
                fields: ['image', 'title', 'category', 'authorName', 'signatureCount'],
                categories: [],
                perPage: 10,
                currentPage: 1,
                titleFilter: "",
                categoryFilter: "",
                sortFilter: "",
                titleFilterClicked: false,
                categoryFilterClicked: false,
                sortFilterClicked: false
            }
        },
        mounted: function() {
            this.getPetitions();
            this.getCategories();
        },
        computed: {
            rows() {
                return this.petitions.length;
            },
            startPageSum() {
                if (this.petitions.length === 0) {
                    return 0;
                }

                if ((this.currentPage - 1) * this.perPage === 0) {
                    return 1;
                } else {
                    return ((this.currentPage - 1) * this.perPage) + 1;
                }
            },
            endPageSum() {
                let difference = this.petitions.length - (this.perPage * this.currentPage);
                if (difference >= 0) {
                    return this.perPage * this.currentPage;
                } else {
                    return this.petitions.length;
                }
            }
        },
        methods: {
            getPetitions: function() {
                this.$http.get('http://localhost:4941/api/v1/petitions')
                    .then((response) => {
                        const petitions = response.data;
                        for (let i in petitions) {
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
                        this.originalPetitions = Array.from(this.petitions);
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
            getCategories: function() {
                this.$http.get('http://localhost:4941/api/v1/petitions/categories')
                    .then((response) => {
                        this.categories = response.data;
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },

            resetPetitions: function() {
                this.petitions = Array.from(this.originalPetitions);
            },



            searchByTitle: function() {
                let titleFilter = document.getElementById("searchBox").value;
                let query;
                if (this.categoryFilterClicked && this.sortFilterClicked) {
                    query =
                        {
                            q: titleFilter,
                            categoryId: this.categoryFilter,
                            sortBy: this.sortFilter
                        };
                } else if (this.categoryFilterClicked) {
                    query =
                        {
                            q: titleFilter,
                            categoryId: this.categoryFilter
                        };
                } else if (this.sortFilterClicked) {
                    query =
                        {
                            q: titleFilter,
                            sortBy: this.sortFilter
                        };
                } else {
                    query =
                        {
                            q: titleFilter
                        };
                }

                this.$http.get('http://localhost:4941/api/v1/petitions',
                    {
                        params: query
                    })
                    .then((response) => {
                        this.titleFilter = titleFilter;
                        this.titleFilterClicked = true;

                        this.petitions = [];
                        const petitions = response.data;
                        for (let i in petitions) {
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
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },



            filterByCategory: function(categoryId) {
                let query;
                if (this.titleFilterClicked && this.sortFilterClicked) {
                    query =
                        {
                            q: this.titleFilter,
                            categoryId: categoryId,
                            sortBy: this.sortFilter
                        };
                } else if (this.titleFilterClicked) {
                    query =
                        {
                            q: this.titleFilter,
                            categoryId: categoryId,
                        };
                } else if (this.sortFilterClicked) {
                    query =
                        {
                            categoryId: categoryId,
                            sortBy: this.sortFilter
                        };
                } else {
                    query =
                        {
                            categoryId: categoryId,
                        };
                }

                this.$http.get('http://localhost:4941/api/v1/petitions',
                    {
                        params: query
                    })
                    .then((response) => {
                        this.categoryFilter = categoryId;
                        this.categoryFilterClicked = true;

                        this.petitions = [];
                        const petitions = response.data;
                        for (let i in petitions) {
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
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },



            sortBy: function(sortFilter) {
                let query;
                if (this.titleFilterClicked && this.categoryFilterClicked) {
                    query =
                        {
                            q: this.titleFilter,
                            categoryId: this.categoryFilter,
                            sortBy: sortFilter
                        };
                } else if (this.titleFilterClicked) {
                    query =
                        {
                            q: this.titleFilter,
                            sortBy: sortFilter
                        };
                } else if (this.categoryFilterClicked) {
                    query =
                        {
                            categoryId: this.categoryFilter,
                            sortBy: sortFilter
                        };
                } else {
                    query =
                        {
                            sortBy: sortFilter
                        };
                }

                this.$http.get('http://localhost:4941/api/v1/petitions',
                    {
                        params: query
                    })
                    .then((response) => {
                        this.sortFilter = sortFilter;
                        this.sortFilterClicked = true;

                        this.petitions = [];
                        const petitions = response.data;
                        for (let i in petitions) {
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
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },

            getPetitionData: function(record) {
                this.$router.push({ name: 'petition', params: { petitionId: record.id }})
            }
        }
    }
</script>

<style scoped>
    body {
        background-color: #eeeeee;
        font-family: 'Open Sans', serif;
        font-size: 14px
    }

    .categoryFilter {
        border-bottom: 1px solid #e4e4e4;
        float: left;
        width: 15%;
        height: 100%;
    }

    .card-header {
        padding: 0.75rem 1.25rem;
        margin-bottom: 0;
        background-color: #fff;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1)
    }

    .categoryFilter .card-header {
        border-bottom: 0
    }

    .icon-control {
        margin-top: 6px;
        float: right;
        font-size: 80%
    }

    .list-menu {
        list-style: none;
        margin: 0;
        padding-left: 0
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
</style>