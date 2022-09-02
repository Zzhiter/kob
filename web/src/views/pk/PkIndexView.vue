<template>
    <!-- 是playing的话才显示Playground -->
    <!-- 在模板中使用store前要加＄，在script中定义的就不用加 -->
    <PlayGround v-if="$store.state.pk.status === 'playing'" />
    <MatchGround v-if="$store.state.pk.status === 'matching'" />
</template>

<script>
import PlayGround from '../../components/PlayGround.vue'
import MatchGround from '../../components/MatchGround.vue'
// onMounted是组件挂载之后执行的函数，
import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export default {
    components: {
        PlayGround,
        MatchGround,
    },
    setup() {
        const store = useStore();
        // 使用jwt token实现websocket连接
        const socketUrl = `ws://127.0.0.1:3000/websocket/${store.state.user.token}/`;

        let socket = null;
        // 当当前组件被挂载的时候，我们执行
        onMounted(() => {

            // 下边的这些东西，写在onMounted也是可以的，这样写，是为了个UnMounted对称
            store.commit("updateOpponent", {
                username: "我的对手",
                photo: "https://cdn.acwing.com/media/article/image/2022/08/09/1_1db2488f17-anonymous.png",
            })

            socket = new WebSocket(socketUrl);

            // 连接成功建立的时候执行的函数
            socket.onopen = () => {
                console.log("connected!");
                // 成功建立连接的时候，我们需要把连接信息存储到全局变量中
                store.commit("updateSocket", socket);
            }
            
            // 当我们接受到信息的时候
            // 这个msg是spring框架定义的，不同框架不一样，spring中是json 
            socket.onmessage = msg => {
                const data = JSON.parse(msg.data);
                if (data.event === "start-matching") {  // 匹配成功
                    // 
                    store.commit("updateOpponent", {
                        username: data.opponent_username,
                        photo: data.opponent_photo,
                    });
                    // 设置一下，不秒变，有个延迟
                    setTimeout(() => {
                        store.commit("updateStatus", "playing");
                    }, 2000);
                    store.commit("updateGamemap", data.gamemap);
                }
            }

            socket.onclose = () => {
                console.log("disconnected!");
            }
        });
        
        // 当前连接被卸载的时候
        onUnmounted(() => {
            // 卸载的时候记得断开连接
            socket.close();
            store.commit("updateStatus", "matching");
        })
    }
}
</script>

<style scoped>
</style>