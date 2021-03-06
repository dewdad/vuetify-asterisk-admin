<template>
    <div>
        <v-card :dark="dark">
            <v-container fluid>
                <v-toolbar color="transparent" card>
                    <v-text-field
                            v-model="search"
                            append-icon="search"
                            label="Search"
                            single-line
                            hide-details
                    />
                    <v-spacer/>
                    <Tbtn icon-color="texts" color="primary" icon="chevron_left" icon-mode tooltip-text="Back to Role List" @onClick="toHome"/>
                    <Tbtn icon-color="texts" color="primary" icon="save" icon-mode tooltip-text="Save" @onClick="showDialog = true"/>

                    <Tbtn icon-color="texts" color="primary" tooltip-text="Select all" icon-mode icon="check_box" @onClick="selectAll"/>
                    <Tbtn icon-color="texts" color="primary" tooltip-text="Unselect all" icon-mode icon="check_box_outline_blank" @onClick="clearAll"/>
                </v-toolbar>
                <v-card-text>
                    <v-layout v-if="items" row wrap>
                        <v-flex v-for="role in items" :key="role.id" md3 sm4 xs6>
                            <v-checkbox v-model="rolesArray" :label="role.name" :value="role.id" color="primary"/>
                        </v-flex>
                    </v-layout>
                </v-card-text>
            </v-container>
        </v-card>
        <Dialog :showDialog="showDialog" text="Are you sure want to update ?" @onClose="showDialog = false" @onConfirmed="attachRoles"/>
    </div>
</template>

<script>
    import { global } from "~/mixins"
    import { USER_URL } from "~/utils/apis"
    import axios from "axios"
    import Dialog from "~/components/Dialog"
    import catchError, { showNoty } from "~/utils/catchError"
    import debounce from "lodash/debounce"
    export default {
        components: { Dialog },
        mixins: [global],
        data() {
            return {
                showDialog: false,
                search: "",
                items: [],
                rolesArray: []
            }
        },
        watch: {
            search() {
                if (this.search !== "") this.searchRoles()
            }
        },
        mounted() {
            this.items = this.$store.getters.getRoles("")
            this.setRoleArray()
        },
        computed: {
            dark() {
                return this.$store.state.dark
            }
        },
        methods: {
            toHome() {
                this.$router.push("/users")
            },
            setRoleArray() {
                if (this.currentEdit.roles) {
                    this.currentEdit.roles.forEach(r => {
                        this.rolesArray.push(r.id)
                    })
                }
            },
            selectAll() {
                if (this.items) {
                    this.rolesArray = []
                    this.items.forEach(c => {
                        this.rolesArray.push(c.id)
                    })
                }
            },
            clearAll() {
                this.rolesArray = []
            },
            searchRoles: debounce(function() {
                let results = this.$store.getters.getRoles(this.search)
                this.items = results
            }, 300),
            async attachRoles() {
                try {
                    this.activateLoader()

                    let formData = {
                        name: this.currentEdit.name,
                        email: this.currentEdit.email,
                        phone: this.currentEdit.phone,
                        address: this.currentEdit.address,
                        roles: this.rolesArray
                    }
                    const resp = await axios
                        .put(USER_URL + "/" + this.currentEdit.id, formData)
                        .then(res => res.data)
                    this.$store.commit("currentEdit", resp.data)
                    showNoty("Data Saved", "success")
                    this.showDialog = false
                    this.deactivateLoader()
                } catch (e) {
                    this.deactivateLoader()

                    catchError(e)
                }
            }
        }
    }
</script>

<style scoped>
</style>
