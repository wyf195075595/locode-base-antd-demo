/*
 * @Description: 
 * @Author:  
 * @Date: 2023-05-31 23:20:02
 * @LastEditTime: 2023-06-21 16:17:20
 * @LastEditors:  
 */
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import { injectAssets } from '@alilc/lowcode-plugin-inject';
// import assets from '../../services/assets.json';
import { getPageSchema, getAssets } from '../../services/mockService';
const EditorInitPlugin = (ctx: IPublicModelPluginContext, options: any) => {
  return {
    async init() {
      const { material, project, config } = ctx;
      const scenarioName = options['scenarioName'];
      const scenarioDisplayName = options['displayName'] || scenarioName;
      const scenarioInfo = options['info'] || {};
      // 保存在config中用于引擎范围其他插件使用
      config.set('scenarioName', scenarioName);
      config.set('scenarioDisplayName', scenarioDisplayName);
      config.set('scenarioInfo', scenarioInfo);

      // 设置物料描述
      const assets = await getAssets();
      console.log("物料:", assets);
      
      await material.setAssets(await injectAssets(assets));

      const schema = await getPageSchema(scenarioName);

      // 加载 schema
      project.openDocument(schema);
    },
  };
}
EditorInitPlugin.pluginName = 'EditorInitPlugin';
EditorInitPlugin.meta = {
  preferenceDeclaration: {
    title: '保存插件配置',
    properties: [
      {
        key: 'scenarioName',
        type: 'string',
        description: '用于localstorage存储key',
      },
      {
        key: 'displayName',
        type: 'string',
        description: '用于显示的场景名',
      },
      {
        key: 'info',
        type: 'object',
        description: '用于扩展信息',
      }
    ],
  },
};
export default EditorInitPlugin;