/*
 * @Description: 
 * @Author:  
 * @Date: 2023-06-05 17:24:46
 * @LastEditTime: 2023-06-20 10:50:46
 * @LastEditors:  
 */
import { IPublicModelPluginContext } from '@alilc/lowcode-types';
import type { MenuProps } from 'antd';
import { Menu } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getSchameList, getPageSchema } from '../../services/mockService';
import { config, project } from '@alilc/lowcode-engine';

type MenuItem = Required<MenuProps>['items'][number];
const MutiplePagePlugin = (ctx: IPublicModelPluginContext)=> {
    return {
        async init() {
            const { skeleton, config } = ctx;
            const scenarioDisplayName = config.get('scenarioDisplayName');
            const scenarioInfo = config.get('scenarioInfo');
            console.log(config);
            // 注册 logo widget
            skeleton.add({
                area: 'leftArea',
                name: 'MutiplePagePlugin',
                type: 'PanelDock',
                props: {
                  description: '页面管理',
                  align: 'top',
                  icon: "zujianku"
                },
                content: Munus,
            });
          },
    }
}
// 插件名，注册环境下唯一
MutiplePagePlugin.pluginName = 'MutiplePagePlugin';
export default MutiplePagePlugin;

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
}
const Munus =  () => {
    let [openKeys, setOpenKeys] = useState(["sub1"]);
    let [menus, setMenus] = useState([]);

    useEffect(() => {
        getSchameList().then(res=> {
            let { results, code} = res.data;
            if(code === 200) {
                const items = [
                    getItem('页面', 'sub1', <MailOutlined />, 
                        results.map(page  => {
                            return getItem(page.name, page.locator)
                        })
                    )
                ];
                setMenus(items);
            }
            
        });
    }, [])

    const page: string = new URLSearchParams(window.location.search).get("page") || "";
    
    const onSelectHandle = async (e: any) => {
        const {key} = e;
        const schema = await getPageSchema(key);
        console.log(schema);
        
        project.removeDocument(project.currentDocument as any);
        project.openDocument(schema);
        config.set("scenarioName", key);
        // window.location.href = `${window.location.pathname}?page=${e.key}`;
    }
    return (
        <div>
            <Menu
                mode="inline"
                defaultOpenKeys={openKeys}
                defaultSelectedKeys={[page]}
                // style={{ width: 256 }}
                onSelect={ onSelectHandle}
                items={menus}
            />
        </div>
    )
}
