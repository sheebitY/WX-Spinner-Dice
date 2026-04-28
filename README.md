# 🎡 微信小程序中可以自定义的转盘与摇骰子功能

## ✨ 功能特性 (Features)

### 1.大转盘 
* 根据选项数量自动等分转盘，并动态生成鲜艳的交替色彩；内置“今日午餐”等常用场景，支持自由添加、修改和长按删除自定义场景；精心调优的贝塞尔曲线动画，并配合 `wx.vibrateLong` 原生震动。
* <img width="395" height="785" alt="63dda13e5d167527090595e2c104a8cd" src="https://github.com/user-attachments/assets/97b60521-5c3a-43de-babb-214bc9cc2618" />


### 2. 3D 摇骰子 (3D Dice Roller)
* 支持通过滑块自由选择 1 ~ 6 颗骰子同屏投掷；完全依靠 CSS `transform-style: preserve-3d` 与透视视角构建的真 3D 立体空间；投掷结束后，自动计算并清晰展示总点数。
<img width="395" height="785" alt="b713352ccf2bf0a0a6b29a1822835854" src="https://github.com/user-attachments/assets/d6387299-7541-4aa5-a1a3-d193fcbd6a0a" />

本项目在前端视觉与交互体验上做了深度优化，适合作为微信小程序原生开发的参考学习项目：

- **极简 Grid 点数布局**：摒弃了繁琐的绝对定位，利用 `display: grid` 将骰子面划分为 3x3 网格，通过 `grid-area` 极其优雅地实现了 1-6 个点数的精准排布。
- **动态锥形渐变 (Conic-Gradient)**：转盘背景未使用任何静态图片，而是通过 JS 动态拼接 `conic-gradient` 属性，实现任意数量选项的完美等分与上色。
- **纯 CSS 物理动画魔法**：使用 `transition: transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)` 模拟物理重力和摩擦力，在不使用 Canvas/WebGL 的情况下实现了极具表现力的 3D 翻滚动画。
- **数据持久化**：结合微信本地缓存 (`wx.setStorageSync`) 实现用户自定义场景库的长期保存。
