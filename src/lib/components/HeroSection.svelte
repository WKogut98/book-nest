<script lang="ts">
    import {Button} from '$components';
    import heroImage from '$assets/hero.png';
</script>

<section class ="hero default-margin">
    <div class="hero-text">
        <h1>Book Nest</h1>
        <h3>Your personal book library</h3>
        <h4 class = "mt-l mb-s">
            Create your very own digital library where you can keep track of every book you own. Happy reading!
        </h4>
        <Button href="/register">Sign up</Button>
    </div>
    <img class="hero-image" src={heroImage} alt="">
</section>

<style>
    .hero{
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 100px;
        margin-bottom: 80px;
    }
    .hero-image{
        width: 40%;
    }

    .hero-text{
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 55%;
        padding-right: 50px;
    }
</style>