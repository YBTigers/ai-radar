(function(){
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n}
  function init(){
    const status=document.querySelector(".status span:last-child");if(status)status.textContent="官方 RSS 新闻 · 暂无可核验榜单";
    const home=document.querySelector("#page-home"),news=document.querySelector("#page-news"),ranking=document.querySelector("#page-rankings");
    if(home){
      const h=home.querySelector(".section-head");
      if(h){h.querySelector("h2").textContent="官方最新动态";h.querySelector("p").textContent="仅显示官方 RSS 原文标题、链接和发布时间"}
      const live=el("div","card");
      live.innerHTML='<div class="card-title"><h3>来源可核验的动态</h3><span class="pill fresh" id="homeLiveStatus">正在获取官方 RSS…</span></div><div class="newslist" id="homeLive"></div>';
      if(h)h.after(live);
      const demo=home.querySelector("#homeNews");
      if(demo){const title=demo.closest(".card").querySelector("h3");if(title)title.textContent="常青解读示例";const badge=demo.closest(".card").querySelector(".pill");if(badge){badge.textContent="非新闻 · 学习内容";badge.className="pill demo"}}
    }
    if(news){
      const header=news.querySelector(".section-head"),badge=header&&header.querySelector(".pill");
      if(badge){badge.textContent="官方动态与学习内容分区";badge.className="pill"}
      const live=el("div","card");live.style.marginBottom="15px";
      live.innerHTML='<div class="card-title"><h3>官方来源动态</h3><span class="pill fresh" id="liveNewsStatus">正在获取官方 RSS…</span></div><div class="newslist" id="liveNews"></div><div class="notice">只展示官方 RSS 原始标题、文章链接和发布时间，不生成未经核实的摘要或重要性评分。</div>';
      const toolbar=news.querySelector(".toolbar");if(toolbar)toolbar.before(live);
      const all=news.querySelector("#allNews"),demoTitle=all&&all.closest(".card").querySelector("h3");
      if(demoTitle)demoTitle.textContent="常青学习内容示例";
      const note=all&&all.parentElement.querySelector(".notice");
      if(note)note.textContent="这些卡片用于解释概念，不代表当天新闻，也不含实时报道。官方动态请看上方独立分区。";
      const search=news.querySelector("#newsSearch");if(search)search.placeholder="搜索学习示例…";
      const sort=news.querySelector("#newsSort");
      if(sort){sort.innerHTML='<option value="featured">默认顺序</option>';sort.addEventListener("change",e=>e.stopImmediatePropagation(),true)}
    }
    if(ranking){
      const badge=ranking.querySelector(".section-head .pill.demo");
      if(badge){badge.textContent="暂未接入评测数据";badge.className="pill"}
      const p=ranking.querySelector(".rank-layout .section-head p");
      if(p)p.textContent="当前没有已接入并核验的榜单数据，因此不展示模型名次或分数。";
      const tbody=ranking.querySelector("#rankBody");
      const empty=()=>{if(tbody)tbody.innerHTML='<tr><td colspan="5" class="empty">尚未接入可核验的公开榜单；暂不展示名次或分数。</td></tr>'};
      empty();const tabs=ranking.querySelector("#rankTabs");
      if(tabs)tabs.addEventListener("click",e=>{e.stopImmediatePropagation();empty()},true)
    }
    load()
  }
  function card(item){
    const article=el("article","newsitem"),icon=el("div","newsicon","↗"),body=el("div"),title=el("h4",null,item.title),meta=el("div","meta");
    meta.append(el("span",null,item.source+" 官方发布"));
    const date=new Date(item.publishedAt),time=el("time",null,Number.isFinite(date.getTime())?new Intl.DateTimeFormat("zh-CN",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Shanghai"}).format(date):"发布时间未知");
    time.dateTime=item.publishedAt;meta.append(time);
    const link=el("a","textlink","阅读官方原文 ↗");link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";
    body.append(title,meta,link);article.append(icon,body);return article
  }
  async function load(){
    const home=document.querySelector("#homeLive"),list=document.querySelector("#liveNews");if(!home||!list)return;
    try{
      const response=await fetch("/api/news");if(!response.ok)throw Error("RSS unavailable");
      const data=await response.json(),targets=[home,list];
      targets.forEach(target=>{target.replaceChildren();if(data.items.length)data.items.forEach(item=>target.append(card(item)));else target.append(el("div","empty","当前没有可显示的官方动态；未混入演示内容。"))});
      const online=data.sources.filter(s=>s.ok).length,label=online+" / "+data.sources.length+" 个官方源可用 · 更新于 "+new Intl.DateTimeFormat("zh-CN",{timeStyle:"short",timeZone:"Asia/Shanghai"}).format(new Date(data.fetchedAt));
      ["homeLiveStatus","liveNewsStatus"].forEach(id=>{const n=document.getElementById(id);if(n)n.textContent=label})
    }catch{
      [home,list].forEach(target=>target.replaceChildren(el("div","empty","暂时无法读取官方 RSS；请稍后重试。演示内容不会显示在此区域。")));
      ["homeLiveStatus","liveNewsStatus"].forEach(id=>{const n=document.getElementById(id);if(n)n.textContent="官方源暂不可用"})
    }
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init()
})();