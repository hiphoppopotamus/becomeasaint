<template>
    <div id="home">
        <WebsiteHeader/>
        <div id="app">
            <h1><br/><br/></h1>
            <div class="container h-100">
                <div class="row h-100 align-items-center">
                    <div class="col-12 text-center">
                        <h1>Change the world</h1>
                        <h4 v-if="!isLoggedIn">Become a saint and create your own petition</h4>
                        <h4 v-else="isLoggedIn">What shall we do today, Holy Saint {{ this.name }}?</h4>
                        <form>
                            <div class="col text-center">
                                <table>
                                    <tr>
                                        <td id="i1">
                                            <router-link v-if="!isLoggedIn" :to="{ name: 'login' }">
                                                <button type="submit" id="loginButton" class="btn btn-primary">Log In</button>
                                            </router-link>
                                            <router-link v-else :to="{ name: 'profile', params: { userId: this.userId } }">
                                                <button type="submit" id="profileButton" class="btn btn-primary">My Profile</button>
                                            </router-link>
                                        </td>
                                        <td id="i2">
                                            <router-link v-if="!isLoggedIn" :to="{ name: 'register' }">
                                                <button type="submit" id="registerButton" class="btn btn-primary">Register</button>
                                            </router-link>
                                            <router-link v-else :to="{ name: 'petitions' }">
                                                <button type="submit" id="petitionsButton" class="btn btn-primary">Petitions</button>
                                            </router-link>
                                        </td>
                                    </tr>
                                </table>


                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>

        </div>
    </div>
</template>

<script>
    export default {
        data: function () {
            return {
                userId: sessionStorage.getItem("id"),
                name: sessionStorage.getItem("name"),
                isLoggedIn: sessionStorage.getItem("id") !== null
            }
        },
    }
</script>

<style scoped>
    #home {
        background-image: url("fog.jpg");
        background-position: -300px -580px;
        font-family: Futura,sans-serif;
    }

    table {
        alignment: center;
        margin: 0 auto;
    }

    table #i1 {
        padding-right: 7%;
    }

    table button {
        width: 120px;
        border-radius: 16px;
    }

    table #i2 {
        padding-left: 3%;
    }
</style>