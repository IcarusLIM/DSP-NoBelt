<script setup lang="ts">
import { recipes } from '@/dsp/data/recipesData';
import { ref } from 'vue';
import { convert } from '@/dsp/dsp'

const recipesRef = ref(recipes.map((val) => ({ id: val.id, name: val.name })))
recipesRef.value.unshift({ id: -1, name: "--unset--" })

const origin = ref("")
const target = ref("")
const erase = ref(false)
const recipe = ref(-1)

const onTrans = () => {
  try {
    target.value = convert(origin.value, erase.value, recipe.value)
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
    <div class="content">
      <div class="col">
        <div class="header">

          <label for="erase">清除标号</label>
          <input v-model="erase" type="checkbox" id="erase">
          <label for="erase">设置配方</label>
          <select name="recipe" v-model="recipe" style="width:100px;">
            <option v-for="r in recipesRef" :value="r.id">{{r.name}}</option>
          </select>


          <button @click="onTrans" class="ml-auto">转换</button>
        </div>
        <textarea v-model="origin" style="width:100%" rows="8" placeholder="请将原蓝图代码粘贴到此处"></textarea>
      </div>
      <div class="col">
        <div class="header">
          <button @click="onCopy" class="ml-auto">复制</button>
        </div>
        <textarea id="targetBp" v-model="target" rows="8" style="width:100%"></textarea>
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
  display: flex;
}

.header .ml-auto {
  margin-left: auto;
}

@media (min-width: 1024px) {
  .content .col {
    padding: 15px;
  }
}

label+input,
label+select {
  margin-left: 5px;
}

input+label,
select+label {
  margin-left: 10px;
}
</style>
  