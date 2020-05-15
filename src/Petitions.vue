<template>
    <div>
        <div>
            <b-input-group class="mt-3">
                <b-form-input placeholder="Search..."></b-form-input>
                <b-input-group-append>
                    <b-button variant="info">
                        <b-icon-search></b-icon-search>
                    </b-button>
                </b-input-group-append>
            </b-input-group>
        </div>

        <article class="filter-group">
            <header class="card-header">
                <a href="#" data-toggle="collapse" data-target="#collapse_aside1" data-abc="true" aria-expanded="false" class="collapsed">
                    <h6>Categories
                        <b-button variant="outline-secondary" title="Align right">
                            <b-icon-chevron-down></b-icon-chevron-down>
                        </b-button>
                    </h6>
                </a>
            </header>
            <div class="filter-content collapse" id="collapse_aside1" style="">
                <div class="card-body">
                    <ul class="list-menu">
                        <li><a href="#" data-abc="true">Electronics </a></li>
                        <li><a href="#" data-abc="true">Watches </a></li>
                        <li><a href="#" data-abc="true">Laptops </a></li>
                        <li><a href="#" data-abc="true">Clothes </a></li>
                        <li><a href="#" data-abc="true">Accessories </a></li>
                    </ul>
                </div>
            </div>
        </article>

        <div>
            <div class="petitions-main">
                <table class="table table-dark">
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Author's Name</th>
                        <th>Hero's Image</th>
                        <th>Number of Signatures</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="petition in petitions">
                        <td>{{ petition.title }}</td>
                        <td>{{ petition.category }}</td>
                        <td>{{ petition.authorName }}</td>
                        <td> Image </td>
                        <td>{{ petition.signatureCount }}</td>
                    </tr>
                    </tbody>
                </table>
            </div>


            <div class="overflow-auto">
                <p class="mt-3">Current Page: {{ currentPage }}</p>

                <div class="gallery-header">
                    <div class="summary">
                <span class="results">
                    <span class="subset">
                        <b>41</b> to
                        <b>80</b> of
                    </span>
                    <b class="total">10,000</b>
                </span>
                        <span class="results-label">Results</span>
                    </div>

                    <div class="sort-and-toggle">
                        <form method="get" class="sort-form" action="/search?q=Hello&amp;page=2" novalidate="novalidate">
                            <div class="sort">
                                <div>
                            <span class="drop-label">
                                Sort:
                                <span class="sort-container">
                                    <var>Relevance</var>
                                    <span class="drop-arrow"></span>
                                </span>
                            </span>
                                    <select name="sort">
                                        <option value="8" selected="">Relevance</option>
                                        <option value="1">Alphabetically by title, A-Z</option>
                                        <option value="2">Alphabetically by title, Z-A</option>
                                        <option value="4">Number of signatures, most to least</option>
                                        <option value="5">Number of signatures, least to most</option>
                                    </select>
                                </div>
                                <input type="submit" value="Go">
                                <input type="hidden" name="q" value="Hello">
                                <input type="hidden" name="page" value="2">
                            </div>
                        </form>
                    </div>

                    <b-table
                            id="my-table"
                            :items="petitions"
                            :per-page="perPage"
                            :current-page="currentPage"
                            small
                    ></b-table>
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
</template>


<!--the petitions should be sorted by the number of signatures descending (highest to lowest)-->


<script>
    export default {
        data () {
            return {
                error: "",
                errorFlag: false,
                petitions: [],
                perPage: 3,
                currentPage: 1,
            }
        },
        mounted: function() {
            this.getPetitions();
        },
        computed: {
            rows() {
                return this.petitions.length;
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
                                    "title": petitions[i].title,
                                    "category": petitions[i].category,
                                    "authorName": petitions[i].authorName,
                                    "image": "image",
                                    "signatureCount": petitions[i].signatureCount,
                                }
                            )
                        }
                        console.log(this.petitions)
                    })
                    .catch((error) => {
                        this.error = error;
                        this.errorFlag = true;
                    });
            },
        }
    }
</script>

<style scoped>
    body {
        background-color: #eeeeee;
        font-family: 'Open Sans', serif;
        font-size: 14px
    }

    .filter-group {
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

    .filter-group .card-header {
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