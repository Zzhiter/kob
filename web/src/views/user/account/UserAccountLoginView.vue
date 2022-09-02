<template>
<!-- 如果正在从云端拉取信息的话，就先不要展示 -->
    <ContentField v-if="!$store.state.user.pulling_info">
        <div class="row justify-content-md-center">
            <div class="col-3">
                <form @submit.prevent="login">
                    <div class="mb-3">
                        <label for="username" class="form-label">用户名</label>
                        <input v-model="username" type="text" class="form-control" id="username" placeholder="请输入用户名">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">密码</label>
                        <input v-model="password" type="password" class="form-control" id="password" placeholder="请输入密码">
                    </div>
                    <div class="error-message">{{ error_message }}</div>
                    <button type="submit" class="btn btn-primary">提交</button>
                </form>
            </div>
        </div>
    </ContentField>
</template>

<script>
import ContentField from '../../../components/ContentField.vue'
import { useStore } from 'vuex'
import { ref } from 'vue'
import router from '../../../router/index'

export default {
    components: {
        ContentField
    },
    setup() {
        const store = useStore();
        let username = ref('');
        let password = ref('');
        let error_message = ref('');

        // 先判断一下本地有没有token
        const jwt_token = localStorage.getItem("jwt_token");
        // 如果本地有的话
        if (jwt_token) {
            // 调用mutation里边的函数需要用的commit
            // 将token更新进去
            store.commit("updateToken", jwt_token);

            // 然后需要验证一下是否合法
            // 需要从云端获取用户信息，使用getInfo函数
            store.dispatch("getinfo", {
                // 一个是成功之后的回调函数
                success() {
                    // 跳转到首页
                    router.push({ name: "home" });
                    // 更新PullingInfo

                    // 用的是mutation里边的函数的话，用的是commit， 同步操作在mutation里边
                    // 用的action里边函数的话，用的是dispatch， 异步修改在action里边
                    store.commit("updatePullingInfo", false);
                },
                // 一个是失败的回调函数
                error() {
                    store.commit("updatePullingInfo", false);
                }
            })
        } else {
            store.commit("updatePullingInfo", false);
        }

        const login = () => {
            error_message.value = "";
            store.dispatch("login", {
                username: username.value,
                password: password.value,
                success() {
                    store.dispatch("getinfo", {
                        success() {
                            router.push({ name: 'home' });
                        }
                    })
                },
                error() {
                    error_message.value = "用户名或密码错误";
                }
            })
        }

        return {
            username,
            password,
            error_message,
            login,
        }
    }
}
</script>

<style scoped>
button {
    width: 100%;
}
div.error-message {
    color: red;
}
</style>