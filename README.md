# dsp_blueprint_no_belt

> thanks to (huww98)[https://github.com/huww98/dsp_blueprint_editor] for 蓝图解析代码

戴森球计划无带蓝图转换工具 [链接](https://github.com/IcarusLIM/DSP-NoBelt)，适合一塔一物

## 使用方法

1. 游戏内建一个正常的蓝图

!(new)[https://raw.githubusercontent.com/IcarusLIM/DSP-NoBelt/2ab9e47db1eed332c857abcb8e8c777020491191/imgs/step1.jpg]

2. 删除多余传送带，并标记（标记方式见后文）

!(cut)[https://raw.githubusercontent.com/IcarusLIM/DSP-NoBelt/2ab9e47db1eed332c857abcb8e8c777020491191/imgs/step2.jpg]

3. 复制蓝图代码，粘贴到本工具左侧输入框，点击“转换”，将右侧框的结果在游戏内新建蓝图保存

!(trans)[https://raw.githubusercontent.com/IcarusLIM/DSP-NoBelt/2ab9e47db1eed332c857abcb8e8c777020491191/imgs/step3.jpg]

4. 拍下转换后的蓝图，传送带放入物品后正常运转

!(Done)[https://raw.githubusercontent.com/IcarusLIM/DSP-NoBelt/2ab9e47db1eed332c857abcb8e8c777020491191/imgs/step4.jpg]

## 代码逻辑

蓝图需要手动标记，代码根据标记连接传送带和分拣器，同标记的传送带节点会均匀分配爪子（注意每个传送带节点最多连接8个爪子）

支持两种标记方式，详解如下

### 显式标记

> 对应上图熔炉的标记方式

需要标记 传送带输入、输出节点，爪子输入、输出的过滤器，按标记匹配

因为没有做传送带起点、终点判断，不兼容同一种产物既往传送带输入又从传送带输出

### 默认标记

> 对应上图制造台的标记方式

需要标记 传送带的输入、输出节点，标记的标签固定选取“图标选取->信号”下的 0-4

0：分拣器输出到传送带  
1-4：传送带输入到分拣器（因此最多支持4种不同输入）  

爪子与传送带匹配逻辑：

1. 所有输出的爪子连接到标记“0”的传送带  
2. 代码首先扫描蓝图中的所有未设置过滤的爪子，将爪子按位置和长度分组  
    - 上图所有制造台上方左侧的爪子会分到同一组  
    - 如果输出的爪子存在多种类型（如上图制造台的两个输出），则认为蓝图中存在通过旋转得到的建筑，会将中心对称的爪子分到同一组（如制造台上中和下中）  
3. 传送带按标号、爪子按分组连接（如果每个标号包含的传送带节点个数不同，则短传送带优先连接多的）



