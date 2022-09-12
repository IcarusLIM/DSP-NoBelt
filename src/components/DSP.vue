<script setup lang="ts">
import { ref } from 'vue';
import { convert } from '../dsp/dsp'

const origin = ref("")
const target = ref("")
const errMsg = ref("")

const onTrans = () => {
  try {
    target.value = convert(origin.value, true)
  } catch (error) {
    alert(error)
    throw error;
  }
}

const onCopy = () => {
  navigator.clipboard.writeText(target.value)
    .then(() => {
      alert('蓝图已复制到剪切板 ^_^');
    })
    .catch(err => {
      alert(err)
    });
}
</script>
  
<template>

  <div class="main-content">
    <div v-if="errMsg">{{errMsg}}</div>
    <div class="content">
      <div class="col">
        <div class="header">
          <button @click="onTrans">转换</button>
        </div>
        <textarea v-model="origin" style="width:90%" rows="8" placeholder="请将原蓝图代码粘贴到此处"></textarea>
      </div>
      <div class="col">
        <div class="header">
          <button @click="onCopy">复制</button>
        </div>
        <textarea id="targetBp" v-model="target" rows="8" style="width:90%"></textarea>
      </div>
    </div>
  </div>

  <div class="thanks">
    thanks to <a href="https://github.com/huww98/dsp_blueprint_editor" target="_blank">huww98</a>
  </div>
</template>

<style>
.thanks {
  margin: 5px;
  position: fixed;
  left: 0;
  bottom: 0;
}

.split-wrap {
  padding: 10px;
}

.content {
  display: flex;
  flex-wrap: wrap;
}

.content .col {
  padding: 5px;
  flex: 1 1 360px;
}

.content .col .header {
  margin: 10px 0;
}
</style>
  