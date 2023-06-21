/*
 * @Description: 
 * @Author:  
 * @Date: 2023-05-31 23:20:02
 * @LastEditTime: 2023-06-21 16:17:57
 * @LastEditors:  
 */
import { material, project } from '@alilc/lowcode-engine';
import { filterPackages } from '@alilc/lowcode-plugin-inject'
import { Message, Dialog } from '@alifd/next';
import { IPublicEnumTransformStage } from '@alilc/lowcode-types';
// import schema from './schema.json';


// const baseURL = "https://vercel-koa-three.vercel.app"
const baseURL = "http://localhost:3030"

export const saveSchema = async (scenarioName: string = 'unknown') => {
  await setProjectSchemaToLocalStorage(scenarioName);
  await setPackagesToLocalStorage(scenarioName);
  Message.success('保存成功');
};

export const resetSchema = async (scenarioName: string = 'unknown') => {
  try {
    await new Promise<void>((resolve, reject) => {
      Dialog.confirm({
        content: '确定要重置吗？您所有的修改都将消失！',
        onOk: () => {
          resolve();
        },
        onCancel: () => {
          reject()
        },
      })
    })
  } catch(err) {
    return;
  }

  let defaultSchema = {
    componentsTree: [{ componentName: 'Page', fileName: 'sample' }],
    componentsMap: material?.componentsMap,
    version: '1.0.0',
    i18n: {},
  };

  project.getCurrentDocument()?.importSchema(defaultSchema as any);
  project.simulatorHost?.rerender();

  setProjectSchemaToLocalStorage(scenarioName);
  await setPackagesToLocalStorage(scenarioName);
  Message.success('成功重置页面');
}

/**
 * 设置本地存储Schema
 * @param scenarioName 
 * @returns 
 */
const setProjectSchemaToLocalStorage = async (scenarioName: string) => {
  let json = project.exportSchema(IPublicEnumTransformStage.Save);
  await fetch(baseURL +"/updateScameFile", {
      method: "post",
      body: JSON.stringify({
          json: json,
          name: scenarioName
      })
  })
}

/**
 * 设置本地存储 Packages
 * @param scenarioName 
 * @returns 
 */
const setPackagesToLocalStorage = async (scenarioName: string) => {
  const packages = await filterPackages(material?.getAssets().packages);
  await fetch(baseURL + "/updatePackageFile", {
      method: "post",
      body: JSON.stringify({
          json: packages,
          name: scenarioName
      })
  })
}


/**
 * 获取本地存储 Packages
 * @param scenarioName 键名
 * @returns 
 */
export const getPackagesFromLocalStorage = async (scenarioName: string) => {
  let res = await fetch(baseURL +`/getJsonByName?name=${scenarioName}`).then(res=> res.json());
  let { data } = res.data;
  return JSON.parse(data[0].package_json);
}

export const getPageSchema = async (scenarioName: string = 'unknown') => {
  let res = await getProjectSchemaFromLocalStorage(scenarioName);
  return res?.componentsTree[0];
};

export const getProjectSchemaFromLocalStorage = async (scenarioName: string = 'unknown') => {
  let rs ;
  try {
    let res = await fetch(baseURL +`/getJsonByName?name=${scenarioName}`).then(res=> res.json());
    let { data } = res.data;
    rs = JSON.parse(data[0]?.schema_json);
  } catch (error) {
    rs = {
      componentsTree: [{ componentName: 'Page', fileName: 'sample' }],
      componentsMap: {},
      version: '1.0.0',
      i18n: {},
    };
  }
  return rs;
};

export const getSchameList = async () => {
  let rs = await fetch(baseURL +`/getSchameList`).then(res=> res.json());
  return rs.data
}

export const getAssets = async (scenarioName: string = 'assets') => {
  let rs;
  try {
    let res = await fetch(baseURL +`/getJsonByName?name=${scenarioName}`).then(res=> res.json());
    let { data } = res.data;
    rs = JSON.parse(data[0]?.assets_json);
  } catch (error) {
    console.warn("getAssets failed: ", error);
    
  }
  return rs;
}