package main

import (
	"Go_Arknights_Gacha/utils"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

func groupByPoolName(data []utils.CharInfo) map[string][]utils.CharInfo {
	groupedData := make(map[string][]utils.CharInfo)
	for _, item := range data {
		key := item.PoolName
		groupedData[key] = append(groupedData[key], item)
	}
	return groupedData
}

//func saveAsJSON(groupedData map[string][]utils.CharInfo, filename string) error {
//	jsonData, err := json.MarshalIndent(groupedData, "", "  ")
//	if err != nil {
//		return fmt.Errorf("error marshaling JSON: %v", err)
//	}
//
//	err = ioutil.WriteFile(filename, jsonData, 0644)
//	if err != nil {
//		return fmt.Errorf("error writing file: %v", err)
//	}
//	return nil
//}

func getGachaData() (allHistoryData []utils.CharInfo) {
	token, err := utils.TokenByPhoneAndPasswordPost()
	if err != nil {
		return
	}
	grantToken, _, gErr := utils.GrantPost(token)
	if gErr != nil {
		return
	}
	uid, bingingErr := utils.BindingListGet(grantToken, "arknights")
	if bingingErr != nil {
		return
	}
	u8Token, u8Err := utils.U8TokenByUidPost(uid, grantToken)
	if u8Err != nil {
		return
	}
	akCookie := utils.LoginPost(u8Token)
	category := utils.GachaCategoryGet(akCookie, uid, u8Token, token)
	allHistoryData = make([]utils.CharInfo, 0)
	// 保存所有分页的抽卡记录
	for _, categoryID := range category {
		var gachaTs string
		var pos string
		for {
			historyData := utils.GachaHistoryGet(akCookie, uid, categoryID.ID, token, gachaTs, pos, u8Token)
			if historyData.HasMore {
				allHistoryData = append(allHistoryData, historyData.List...)
				gachaTs = historyData.List[len(historyData.List)-1].GachaTs
				pos = strconv.Itoa(historyData.List[len(historyData.List)-1].Pos)
			} else {
				allHistoryData = append(allHistoryData, historyData.List...)
				break
			}
		}
	}
	return allHistoryData
}

// todo: 记得去token_by_phone_and_password里面改自己的手机和密码，grant的AppCode也请自行在官网F12一些接口里面获得
func main() {
	allHistoryData := getGachaData()
	if allHistoryData == nil {
		log.Println("Failed to retrieve gacha data")
		return
	}
	poolNameGrouped := groupByPoolName(allHistoryData)

	http.HandleFunc("/gacha-history", func(w http.ResponseWriter, r *http.Request) {
		jsonData, err := json.MarshalIndent(poolNameGrouped, "", "  ")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Write(jsonData)
	})

	// 处理静态文件
	fs := http.FileServer(http.Dir("./asset"))
	http.Handle("/", fs)

	log.Println("Server started on :8081")
	log.Fatal(http.ListenAndServe(":8081", nil))
}
