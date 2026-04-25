import streamlit as st

# ඔයාගේ ලෝගෝ එක පේන්න නම් මේ ලින්ක් එක හරියටම තියෙන්න ඕනේ
LOGO_URL = "https://raw.githubusercontent.com/induwarapivindu-art/PIVINDU-ULTIMATE-AI/main/1000137821.png"

st.set_page_config(page_title="PIVINDU ULTIMATE AI", layout="centered")

# CSS for Neon Blue UI (No Black Text)
st.markdown(f"""
    <style>
    .stApp {{ background-color: #FFFFFF; }}
    .p-logo {{ display: block; margin: auto; width: 120px; border-radius: 50%; filter: drop-shadow(0 0 15px #00F2FF); }}
    .p-title {{ font-size: 3rem; font-weight: 900; text-align: center; color: #004080; }}
    .p-subtitle {{ font-size: 3.5rem; font-weight: 900; text-align: center; color: #00F2FF; margin-top: -25px; }}
    </style>
    """, unsafe_allow_html=True)

# Login UI
st.markdown(f'<img src="{LOGO_URL}" class="p-logo">', unsafe_allow_html=True)
st.markdown('<p class="p-title">PIVINDU</p>', unsafe_allow_html=True)
st.markdown('<p class="p-subtitle">ULTIMATE AI</p>', unsafe_allow_html=True)

if st.button("CONTINUE WITH GOOGLE"):
    st.success("System core linked successfully!")
