// 如果import的对应的export出的类没有default，那么就需要用花括号括起来
import { AcGameObject } from "./AcGameObject"; 
import { Wall } from "./Wall";

// 外部要用到地图，所以export出去
export class GameMap extends AcGameObject {
    // 传入画布，画布的父元素，用来动态修改画布的长宽
    constructor(ctx, parent) {
        super();

        this.ctx = ctx;
        this.parent = parent;
        this.L = 0; // 表示单位长度

        this.rows = 13;
        this.cols = 13;
        
        // 墙的个数
        this.inner_walls_count = 20;
        // 用来存储所有的墙
        this.walls = [];
    }

    // 判断一下随机生成的图是否联通
    // 使用floodfill算法
    // 传入图，起点横纵坐标，终点横纵坐标
    check_connectivity(g, sx, sy, tx, ty) {
        if (sx == tx && sy == ty) return true;
        g[sx][sy] = true;

        let dx = [-1, 0, 1, 0], dy = [0, 1, 0, -1];
        for (let i = 0; i < 4; i ++ ) {
            let x = sx + dx[i], y = sy + dy[i];
            if (!g[x][y] && this.check_connectivity(g, x, y, tx, ty))
                return true;
        }

        return false;
    }

    // 创建墙的函数
    create_walls() {
        // 初始化障碍物
        const g = [];
        for (let r = 0; r < this.rows; r ++ ) {
            g[r] = [];
            for (let c = 0; c < this.cols; c ++ ) {
                g[r][c] = false;
            }
        }

        // 给四周加上障碍物
        for (let r = 0; r < this.rows; r ++ ) {
            g[r][0] = g[r][this.cols - 1] = true;
        }

        for (let c = 0; c < this.cols; c ++ ) {
            g[0][c] = g[this.rows - 1][c] = true;
        }

        // 创建随机障碍物
        for (let i = 0; i < this.inner_walls_count / 2; i ++ ) {
            for (let j = 0; j < 1000; j ++ ) {
                // 行和列的随机值
                let r = parseInt(Math.random() * this.rows);
                let c = parseInt(Math.random() * this.cols);
                // 如果重复了就再来
                if (g[r][c] || g[c][r]) continue;
                // 左上角和右下角不许有墙
                if (r == this.rows - 2 && c == 1 || r == 1 && c == this.cols - 2)
                    continue;

                g[r][c] = g[c][r] = true;
                break;
            }
        }
        
        // js中深度复制一个对象：先转换成json，然后再把json解析出来
        const copy_g = JSON.parse(JSON.stringify(g));
        if (!this.check_connectivity(copy_g, this.rows - 2, 1, 1, this.cols - 2))
            return false;
        
        // 真正的创建
        for (let r = 0; r < this.rows; r ++ ) {
            for (let c = 0; c < this.cols; c ++ ) {
                if (g[r][c]) {
                    this.walls.push(new Wall(r, c, this));
                }
            }
        }

        return true;
    }

    start() {
        // 随机一千次，总会出来一次联通的
        for (let i = 0; i < 1000; i ++ ) 
            if (this.create_walls())
                break;
    }

    // 每一帧都更新一下边长
    update_size() {
        // 渠成整像素，防止出现缝隙
        this.L = parseInt(Math.min(this.parent.clientWidth / this.cols, this.parent.clientHeight / this.rows));
        this.ctx.canvas.width = this.L * this.cols;
        this.ctx.canvas.height = this.L * this.rows;
    }

    // 每帧执行一次
    update() {  
        this.update_size();
        this.render();
    }

    render() {
        // 横纵坐标和为偶数的颜色
        const color_even = "#AAD751", color_odd = "#A2D149";
        for (let r = 0; r < this.rows; r ++ ) {
            for (let c = 0; c < this.cols; c ++ ) {
                if ((r + c) % 2 == 0) {
                    this.ctx.fillStyle = color_even;
                } else {
                    this.ctx.fillStyle = color_odd;
                }
                // 坐标，坐标，宽度，宽度
                this.ctx.fillRect(c * this.L, r * this.L, this.L, this.L);
            }
        }
    }
}