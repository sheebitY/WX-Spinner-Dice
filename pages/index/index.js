Page({
  data: {
    tabs: ['大转盘', '摇骰子'],
    currentTab: 0, 

    // 转盘UI数据
    inputValue: '',         
    wheelResult: '',
    isSpinning: false,
    wheelDeg: 0,
    wheelData: [],
    bgStyle: '',

    // ✨ 核心场景数据
    presets: {},
    currentPresetName: '', // 当前正在使用的场景名
    wheelOptions: [],      // 当前场景下的选项数组

    diceValue: 1, 
    isRolling: false,
    diceCount: 1,          // 当前骰子数量
    diceSum: 0,            // 总点数
    isRolling: false,      // 是否正在摇动
    diceList: [            // 骰子实体数组
      { id: 0, val: 1, rotX: 0, rotY: 0 } 
    ]
  },

  onLoad() {
    // 1. 定义出厂默认场景
    const defaultPresets = {
      '今日午餐': ['火锅', '烧烤', '肯德基', '麦当劳', '沙拉', '轻食'],
      '周末去哪': ['看电影', '逛公园', '宅家打游戏', '去图书馆', '吃大餐'],
    };
    
    // 2. 读取本地缓存，没有则用默认
    const customPresets = wx.getStorageSync('myCustomPresets') || defaultPresets;
    const firstSceneName = Object.keys(customPresets)[0];

    this.setData({ 
      presets: customPresets,
      currentPresetName: firstSceneName,
      wheelOptions: customPresets[firstSceneName]
    }, () => {
      this.drawWheel();
    });
  },

  // ================= ✨ 场景库管理 =================

  // 点击切换场景
  switchScene(e) {
    if (this.data.isSpinning) return;
    const sceneName = e.currentTarget.dataset.name;
    const options = this.data.presets[sceneName];
    
    this.setData({ 
      currentPresetName: sceneName,
      wheelOptions: options,
      wheelResult: ''
    }, () => {
      this.drawWheel();
    });
  },

  // 新增转盘场景 
  showAddSceneModal() {
    if (this.data.isSpinning) return;
    wx.showModal({
      title: '新建决策场景',
      editable: true,
      placeholderText: '例如：晚上谁洗碗',
      success: (res) => {
        if (res.confirm && res.content) {
          const newName = res.content.trim();
          let { presets } = this.data;
          
          if (presets[newName]) {
            wx.showToast({ title: '场景名已存在', icon: 'none' });
            return;
          }
          
          // 创建新场景并给两个默认选项
          presets[newName] = ['选项A', '选项B']; 
          this.savePresets(presets, newName);
        }
      }
    });
  },

  // 长按删除场景
  deleteScenePrompt(e) {
    if (this.data.isSpinning) return;
    const sceneName = e.currentTarget.dataset.name;
    
    wx.showModal({
      title: '删除场景',
      content: `确定要删除【${sceneName}】吗？`,
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          let { presets } = this.data;
          if (Object.keys(presets).length <= 1) {
            wx.showToast({ title: '至少保留一个场景哦', icon: 'none' });
            return;
          }
          delete presets[sceneName];
          const nextName = Object.keys(presets)[0];
          this.savePresets(presets, nextName);
        }
      }
    });
  },

  // 统一保存场景库到本地
  savePresets(newPresets, activeSceneName) {
    wx.setStorageSync('myCustomPresets', newPresets);
    this.setData({ 
      presets: newPresets,
      currentPresetName: activeSceneName,
      wheelOptions: newPresets[activeSceneName],
      wheelResult: ''
    }, () => {
      this.drawWheel();
    });
  },

  // ================= 选项增删逻辑 =================

  onInputChange(e) { this.setData({ inputValue: e.detail.value }); },

  addOption() {
    const { inputValue, wheelOptions, currentPresetName, presets, isSpinning } = this.data;
    if (isSpinning) return;
    
    const val = inputValue.trim();
    if (!val) { wx.showToast({ title: '内容不能为空', icon: 'none' }); return; }
    if (wheelOptions.length >= 12) { wx.showToast({ title: '最多支持12个选项', icon: 'none' }); return; }
    if (wheelOptions.includes(val)) { wx.showToast({ title: '该选项已存在', icon: 'none' }); return; }

    const newOptions = [...wheelOptions, val];
    presets[currentPresetName] = newOptions; // 更新到总库中
    this.savePresets(presets, currentPresetName);
    this.setData({ inputValue: '' }); 
  },

  deleteOption(e) {
    if (this.data.isSpinning) return;
    const index = e.currentTarget.dataset.index;
    const { currentPresetName, presets } = this.data;
    
    const newOptions = [...presets[currentPresetName]];
    newOptions.splice(index, 1);
    
    presets[currentPresetName] = newOptions; // 更新到总库中
    this.savePresets(presets, currentPresetName);
  },

  // ================= 转盘与画图逻辑 =================
  drawWheel() {
    const options = this.data.wheelOptions;
    const len = options.length;
    if (len === 0) {
      this.setData({ bgStyle: 'background: #eee;', wheelData: [] });
      return;
    }
    const colors = ['#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#FF9F1C', '#8338EC', '#00BBF9', '#F15BB5'];
    let gradient = 'conic-gradient(';
    const slicePercent = 100 / len;
    for (let i = 0; i < len; i++) {
      const color = colors[i % colors.length];
      gradient += `${color} ${i * slicePercent}% ${(i + 1) * slicePercent}%${i === len - 1 ? '' : ', '}`;
    }
    gradient += ')';
    const sliceAngle = 360 / len;
    const wheelData = options.map((item, index) => ({
      text: item, textRotate: index * sliceAngle + (sliceAngle / 2)
    }));
    this.setData({ bgStyle: gradient, wheelData: wheelData });
  },

  startSpin() {
    if (this.data.isSpinning || this.data.wheelOptions.length < 2) {
      if (this.data.wheelOptions.length < 2) wx.showToast({ title: '至少需要2个选项', icon: 'none' });
      return;
    }
    this.setData({ isSpinning: true, wheelResult: '命运挑选跳转中...' });
    const options = this.data.wheelOptions;
    const len = options.length;
    const randomIndex = Math.floor(Math.random() * len);
    const sliceAngle = 360 / len;
    const centerAngle = randomIndex * sliceAngle + (sliceAngle / 2); 
    const currentDeg = this.data.wheelDeg;
    const extraSpins = 360 * 6; 
    const targetDeg = currentDeg + extraSpins + (360 - centerAngle) - (currentDeg % 360);
    this.setData({ wheelDeg: targetDeg });
    setTimeout(() => {
      this.setData({ isSpinning: false, wheelResult: `✨ 决定了：${options[randomIndex]}！` });
      wx.vibrateLong(); 
    }, 3500); 
  },

  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ currentTab: index, wheelResult: '', isSpinning: false, isRolling: false });
  },

  // ================= 3D 骰子核心逻辑 =================

  // 改变骰子数量 (拉动滑块时触发)
  changeDiceCount(e) {
    if (this.data.isRolling) return;
    const count = e.detail.value;
    let newList = [];
    // 根据选择的数量，初始化一排正面朝上(点数1)的骰子
    for (let i = 0; i < count; i++) {
      newList.push({ id: i, val: 1, rotX: 0, rotY: 0 });
    }
    this.setData({ diceCount: count, diceList: newList, diceSum: 0 });
  },

  // 摇骰子
  startRoll() {
    if (this.data.isRolling) return;
    
    this.setData({ isRolling: true, diceSum: 0 });
    wx.vibrateShort(); // 起手震动

    // 定义1到6点对应的终点 3D 旋转角度
    const faceAngles = {
      1: { x: 0, y: 0 },
      2: { x: 0, y: -90 },
      3: { x: 90, y: 0 },
      4: { x: -90, y: 0 },
      5: { x: 0, y: 90 },
      6: { x: 180, y: 0 }
    };

    let newSum = 0;
    let newDiceList = this.data.diceList.map(die => {
      // 随机生成 1-6 的点数
      let finalVal = Math.floor(Math.random() * 6) + 1;
      newSum += finalVal;

      // 让骰子额外随机转动 3 到 5 圈 (每圈 360 度)
      let extraSpinsX = (Math.floor(Math.random() * 3) + 3) * 360; 
      let extraSpinsY = (Math.floor(Math.random() * 3) + 3) * 360;

      // 为了保证动画连续不突兀，在当前累积旋转角度的基础上增加
      let currentBaseX = Math.floor(die.rotX / 360) * 360;
      let currentBaseY = Math.floor(die.rotY / 360) * 360;

      return {
        ...die,
        val: finalVal,
        // 最终角度 = 当前基准 + 额外狂转的圈数 + 该点数固定的面朝上角度
        rotX: currentBaseX + extraSpinsX + faceAngles[finalVal].x,
        rotY: currentBaseY + extraSpinsY + faceAngles[finalVal].y,
      };
    });

    // 触发 CSS 3D 动画
    this.setData({ diceList: newDiceList });

    // 等待 1.2 秒（与 CSS 动画时长一致）后展示结果
    setTimeout(() => {
      this.setData({ isRolling: false, diceSum: newSum });
      wx.vibrateLong(); // 停止震动
    }, 1200);
  },
});