<template>
    <!-- 这样parent就可以指向div了 -->
    <div ref="parent" class="gamemap">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script>
import { GameMap } from "@/assets/scripts/GameMap";
// ref引入canvas
import { ref, onMounted } from 'vue'

export default {
    setup() {
        // vue里边定义变量都需要用到ref
        let parent = ref(null);
        let canvas = ref(null);

        // onMounted是指，组件挂载完之后需要执行哪些操作
        onMounted(() => {
            new GameMap(canvas.value.getContext('2d'), parent.value)
        });

        // 返回之后才可以在template中使用， 这两个就是template中的ref
        return {
            parent,
            canvas
        }
    }
}
</script>

<style scoped>
div.gamemap {
    /* 100%的意思是和父元素等长 */
    width: 100%;
    height: 100%;
    /* 让内容水平居中 */
    display: flex;
    /* 水平居中 */
    justify-content: center;
    /* 竖直居中 */
    align-items: center;
}
</style>