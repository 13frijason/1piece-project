// Supabase 연결 설정
// TODO: Supabase 프로젝트 URL과 API 키를 입력하세요
const SUPABASE_URL = YOUR_SUPABASE_URL;
const SUPABASE_ANON_KEY =YOUR_SUPABASE_ANON_KEY';

// Supabase 클라이언트 생성
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 견적문의 폼 제출 처리
document.addEventListener('DOMContentLoaded', function()[object Object]   const quoteForm = document.getElementById(quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(quoteForm);
            const estimateData =[object Object]              name: formData.get(customer-name),
                phone: formData.get('customer-phone'),
                title: formData.get('service-type'),
                content: formData.get('detailed-request'),
                status:대기중'
            };
            
            try[object Object]             const { data, error } = await supabase
                    .from('estimates')
                    .insert([estimateData]);
                
                if (error) {
                    console.error(Error:                   alert('견적문의 등록에 실패했습니다. 다시 시도해주세요.');
                } else {
                    alert('견적문의가 성공적으로 등록되었습니다!');
                    quoteForm.reset();
                }
            } catch (error)[object Object]           console.error(Error:);
                alert('견적문의 등록에 실패했습니다. 다시 시도해주세요.);         }
        });
    }
});

// 게시판 목록 불러오기 함수
async function loadEstimates() {
    try[object Object]      const { data: estimates, error } = await supabase
            .from('estimates')
            .select(*            .order('created_at', { ascending: false });
        
        if (error) {
            console.error(Error:rror);
            return [];
        }
        
        return estimates ||    } catch (error)[object Object]     console.error(Error:, error);
        return ];
    }
}

// 게시판 HTML 렌더링 함수
function renderEstimates(estimates)[object Object]   const boardList = document.getElementById(board-list);    if (!boardList) return;
    
    if (estimates.length === 0
        boardList.innerHTML = <p>등록된 견적문의가 없습니다.</p>';
        return;
    }
    
    const estimatesHTML = estimates.map(estimate => `
        <div class="estimate-item">
            <div class="estimate-header>
                <h3>$[object Object]estimate.name}</h3
                <span class=estimate-date">${new Date(estimate.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
            <div class="estimate-content>
                <p><strong>서비스:</strong> $[object Object]estimate.title}</p>
                <p><strong>연락처:</strong> $[object Object]estimate.phone}</p>
                <p><strong>상세내용:</strong></p>
                <p>${estimate.content}</p>
                <p><strong>상태:</strong> ${estimate.status}</p>
            </div>
        </div>
    `).join(');    
    boardList.innerHTML = estimatesHTML;
}

// 페이지 로드 시 게시판 목록 불러오기
document.addEventListener('DOMContentLoaded', async function() {
    const estimates = await loadEstimates();
    renderEstimates(estimates);
});

// 실시간 업데이트 (선택사항)
// Supabase의 실시간 구독 기능을 사용하려면 아래 코드를 활성화하세요
/*
supabase
    .channel(estimates')
    .on('postgres_changes', 
   [object Object]event: '*, schema: public', table: 'estimates' }, 
        async (payload) => {
            console.log('Change received!', payload);
            const estimates = await loadEstimates();
            renderEstimates(estimates);
        }
    )
    .subscribe();
*/ 