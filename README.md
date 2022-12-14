# dsp_blueprint_no_belt

> thanks to [huww98](https://github.com/huww98/dsp_blueprint_editor) for 蓝图解析代码

戴森球计划无带蓝图转换工具 [链接](https://icaruslim.github.io/DSP-NoBelt/)

## 使用方法

1. 游戏内建一个正常的蓝图

![new](https://gitee.com/Ghamster/dsp-no-belt/raw/master/imgs/step1.jpg)

2. 删除多余传送带，并标记（标记方式见后文）

![cut](https://gitee.com/Ghamster/dsp-no-belt/raw/master/imgs/step2.jpg)

3. 复制蓝图代码，粘贴到本工具左侧输入框，点击“转换”，将右侧框的结果在游戏内新建蓝图保存

![trans](https://gitee.com/Ghamster/dsp-no-belt/raw/master/imgs/step3.jpg)

4. 拍下转换后的蓝图，传送带放入物品后正常运转

![Done](https://gitee.com/Ghamster/dsp-no-belt/raw/master/imgs/step4.jpg)

## 代码逻辑

蓝图需要手动标记，代码根据标记连接传送带和分拣器，同标记的传送带节点会均匀分配爪子（注意每个传送带节点最多连接8个爪子）

支持两种标记方式，详解如下

### 默认标记

> 对应上图制造台的标记方式

需要标记 传送带的输入、输出节点，标记的标签固定使用“图标选取->信号”下的 0-4

0：分拣器输出到传送带  
1-4：传送带输入到分拣器（因此最多支持4种不同输入）  

爪子与传送带匹配逻辑：

1. 所有输出的爪子连接到标记“0”的传送带  
2. 代码首先扫描蓝图中的所有未设置过滤的爪子，将爪子按位置和长度分组  
    - 上图所有制造台上方左侧的爪子会分到同一组  
    - 如果输出的爪子存在多种类型（如上图制造台的两个输出），则认为蓝图中存在通过旋转得到的建筑，会将中心对称的爪子分到同一组（如制造台上中和下中）  
3. 传送带按标号、爪子按分组连接（如果每个标号包含的传送带节点个数不同，则短传送带优先连接多的）

### 显式标记

> 对应上图熔炉的标记方式

需要标记 传送带输入、输出节点，爪子输入、输出的过滤器，按标记匹配

传送带起始端的连续标记作为爪子输出的位置，末端连续标记作为爪子拿取位置，其他标记不识别，如下图（第二条传送带为正确标记，第三条为错误标记）

![Example1](https://gitee.com/Ghamster/dsp-no-belt/raw/master/imgs/eg1.jpg)

*附测试用蓝图代码*：

```
BLUEPRINT:0,10,0,0,0,0,0,0,637986195566126416,0.9.26.13034,%E6%96%B0%E8%93%9D%E5%9B%BE,"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"7CD5FD31CC09240B958D42F9F8604FB8
```
