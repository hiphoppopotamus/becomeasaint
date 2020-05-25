<template>
    <div class="background">
        <div id="petitionsPage">
            <WebsiteHeader/>
            <header>
                <h1>Join the cause, fight the power</h1>
                <h6>Don't eat the crab dip!</h6>
                <br>
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
                <br>
                <h4 id="categoriesH">Categories</h4>
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
                        <b-button v-on:click="resetPetitions()" variant="info">
                            Reload Petitions <b-icon-arrow-repeat font-scale="1"></b-icon-arrow-repeat>
                        </b-button>
                        <b-dropdown id="dropdown-1" variant="info" text="Sort By:" class="m-md-2">
                            <b-dropdown-item v-on:click="sortBy('SIGNATURES_DESC')">Number of signatures, most to least</b-dropdown-item>
                            <b-dropdown-item v-on:click="sortBy('SIGNATURES_ASC')">Number of signatures, least to most</b-dropdown-item>
                            <b-dropdown-item v-on:click="sortBy('ALPHABETICAL_ASC')">Alphabetically by title, A-Z</b-dropdown-item>
                            <b-dropdown-item v-on:click="sortBy('ALPHABETICAL_DESC')">Alphabetically by title, Z-A</b-dropdown-item>
                        </b-dropdown>
                    </div>

                    <div id="petitionsResults">
                        <b-table
                                striped hover
                                id="my-table"
                                :items="petitions"
                                :fields="fields"
                                :per-page="perPage"
                                :current-page="currentPage"
                                @row-clicked="routeToOnePetition"
                        >
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
        </div>
        <br>
        <br>
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
                sortFilterClicked: false,
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

            routeToOnePetition: function(record) {
                this.$router.push({ name: 'petition', params: { petitionId: record.id }});
            }
        }
    }
</script>

<style scoped>
    header {
        text-align: center;
    }

    body {
        background-color: #eeeeee;
        font-family: 'Open Sans', serif;
        font-size: 14px
    }

    .categoryFilter {
        float: left;
        width: 20%;
        height: 100%;
    }

    #categoriesH {
        padding-left: 10%;
        padding-top: 20%;
    }

    .card-header {
        padding-bottom: 6%;
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

    #petitionsPage {
        margin: 5% 8%;
    }

    .background {
        font-family: Futura,sans-serif;
        background-color: floralwhite;
    }

    button {
        width: 170px;
    }

    #dropdown-1 {
        border-radius: 16px;
    }

    .petitionsHeader {
        display:inline-block;
        /*overflow: auto;*/
        white-space: nowrap;
        width: 50%;
        margin:0px auto;
    }
</style>