<template>
    <div class="Header">
        <nav :key=this.isLoggedIn class="navbar navbar-expand-lg navbar-light bg-light shadow fixed-top">
            <div class="container">
                <!--The below v-on:click does: If your logged in, go to your profile.  Else go to the main page.-->
                <a class="navbar-brand">
                    <header>
                        <h4>becomeasaint.org</h4>
                    </header>
                </a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarResponsive">
                    <ul class="navbar-nav ml-auto">
                        <li class="nav-item-item">
                            <router-link :to="{ name: 'home' }"
                                         class="nav-link">
                                <h4>Home</h4>
                            </router-link>
                        </li>
                        <li class="nav-item-item" v-if=this.isLoggedIn>
                            <router-link :to="{ name: 'profile', params: { userId: this.userId } }"
                                         class="nav-link">
                                <h4>Profile</h4>
                            </router-link>
                        </li>
                        <li class="nav-item-item">
                            <router-link :to="{ name: 'petitions' }"
                                         class="nav-link">
                                <h4>Petitions</h4>
                            </router-link>
                        </li>
                        <li v-if=!this.isLoggedIn class="nav-item">
                            <router-link :to="{ name: 'register' }"
                                         class="nav-link">
                                <h4>Register</h4>
                            </router-link>
                        </li>
                        <li v-if=this.isLoggedIn class="nav-item">
                            <router-link
                                    :to="{ name: 'createPetition' }"
                                    class="nav-link">
                                <h4>Create Petition</h4>
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link v-if="this.isLoggedIn" to="" v-on:click.native="logout" class="nav-link">
                                <h4>Logout</h4>
                            </router-link>
                            <router-link v-else :to="{ name: 'login' }" class="nav-link">
                                <h4>Login</h4>
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
        <br><br><br>
    </div>
</template>

<script>
    export default {
        isLoggedIn: false,
        data: function () {
            return {
                userId: sessionStorage.getItem(`id`),
                isLoggedIn : sessionStorage.getItem("token") !== null,
            }
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
            }
        }
    }
</script>

<style scoped>
    .Header {
        font-family: Futura,sans-serif;
    }
</style>